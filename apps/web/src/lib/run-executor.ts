import { prisma } from '@/lib/db'
import { wsServer } from '@/lib/ws-server'
import { PipelineRunner, type PipelineContext } from '@crewflow/engine'
import { createProvider } from '@crewflow/ai'
import type { AgentDefinition, StepDefinition } from '@crewflow/shared'

// Mapa de runners ativos para pause/resume/cancel via API
const activeRunners = new Map<string, PipelineRunner>()

function generateRunMemories(
  input: string,
  outputs: Map<string, string>,
  steps: StepDefinition[],
  agents: Map<string, AgentDefinition>,
  totalTokens: number,
  totalCost: number,
  durationMs: number,
): string[] {
  const memories: string[] = []
  const date = new Date().toISOString().split('T')[0]

  // Resumo do run
  const stepsCompleted = outputs.size
  memories.push(
    `[${date}] Run com input "${input.slice(0, 100)}${input.length > 100 ? '...' : ''}" — ${stepsCompleted}/${steps.length} steps concluídos, ${totalTokens} tokens, $${totalCost.toFixed(4)}, ${Math.round(durationMs / 1000)}s`
  )

  // Para cada step, extrair aprendizado do output
  for (const step of steps) {
    const output = outputs.get(step.id)
    if (!output) continue

    const agent = agents.get(step.agentId)
    const agentName = agent?.name ?? 'Agent'

    // Salvar um resumo curto de cada output para referência futura
    const summary = output.length > 200 ? output.slice(0, 200) + '...' : output
    memories.push(
      `[${date}] ${agentName} (${step.label}): ${summary}`
    )
  }

  return memories
}

export function getActiveRunner(runId: string): PipelineRunner | undefined {
  return activeRunners.get(runId)
}

async function failRun(runId: string, errorMessage: string, durationMs = 0) {
  await prisma.run.update({
    where: { id: runId },
    data: {
      status: 'failed',
      completedAt: new Date(),
    },
  }).catch(() => {})

  // Salvar erro como log no primeiro RunStep para que a UI consiga mostrar
  const firstStep = await prisma.runStep.findFirst({
    where: { runId },
    orderBy: { createdAt: 'asc' },
  })
  if (firstStep) {
    await prisma.runLog.create({
      data: {
        runStepId: firstStep.id,
        level: 'error',
        message: errorMessage,
      },
    }).catch(() => {})
  }

  wsServer.emitRunStatus(runId, 'failed')
  wsServer.emitRunComplete(runId, 'failed', 0, 0, durationMs, errorMessage)
}

export async function executeRun(runId: string): Promise<void> {
  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: {
      squad: {
        include: {
          agents: {
            include: {
              skills: { include: { skill: true } },
            },
          },
          pipeline: {
            include: {
              steps: { orderBy: { order: 'asc' } },
            },
          },
        },
      },
      steps: {
        include: { step: true },
        orderBy: { createdAt: 'asc' },
      },
      user: true,
    },
  })

  if (!run || !run.squad.pipeline) {
    await failRun(runId, 'Run não encontrado ou sem pipeline configurada.')
    return
  }

  // Buscar API key do provider configurado
  const user = run.user
  let apiKeys: Record<string, string> = {}
  try {
    apiKeys = user.apiKeys ? JSON.parse(user.apiKeys as string) : {}
  } catch {
    await failRun(runId, 'Erro ao ler API keys. Reconfigure em Settings.')
    return
  }

  const provider = apiKeys.anthropic ? 'anthropic' : apiKeys.openai ? 'openai' : null

  if (!provider) {
    await failRun(runId, 'Nenhuma API key configurada. Vá em Settings para adicionar uma chave da Anthropic ou OpenAI.')
    return
  }

  const aiProvider = createProvider(provider, apiKeys[provider]!)

  // Mapear agentes do DB para AgentDefinition
  const agentsMap = new Map<string, AgentDefinition>()
  for (const agent of run.squad.agents) {
    const persona = agent.persona ? JSON.parse(agent.persona as string) : {}
    agentsMap.set(agent.id, {
      id: agent.id,
      name: agent.name,
      icon: agent.icon ?? '🤖',
      role: agent.role,
      persona: {
        role: persona.role ?? persona.role_definition ?? agent.role,
        identity: persona.identity ?? '',
        communicationStyle: persona.communicationStyle ?? persona.communication_style ?? '',
        principles: persona.principles ?? [],
      },
      voiceGuidance: persona.voiceGuidance ?? persona.voice_guidance,
      operationalFramework: persona.operationalFramework ?? persona.operational_framework
        ? JSON.stringify(persona.operationalFramework ?? persona.operational_framework)
        : undefined,
      outputExamples: persona.outputExamples ?? persona.output_examples,
      antiPatterns: persona.antiPatterns ?? persona.anti_patterns,
      qualityCriteria: persona.qualityCriteria ?? persona.quality_criteria,
      skills: agent.skills.map((s) => s.skill.name),
      position: { col: 0, row: 0 },
    })
  }

  // Mapear steps do DB para StepDefinition (incluindo checkpoints)
  const steps: StepDefinition[] = run.squad.pipeline.steps.map((s) => ({
    id: s.id,
    agentId: s.agentId ?? '',
    order: s.order,
    label: s.label,
    execution: s.type as StepDefinition['execution'],
    vetoConditions: s.vetoConditions ? JSON.parse(s.vetoConditions as string) : undefined,
    onReject: s.onReject && s.onReject !== 'retry' ? s.onReject : undefined,
  }))

  if (steps.length === 0) {
    await failRun(runId, 'Pipeline não tem steps com agentes configurados.')
    return
  }

  // Mapear RunStep IDs (stepId -> runStepId) para TODOS os steps (incluindo checkpoints)
  const runStepMap = new Map<string, string>()
  for (const rs of run.steps) {
    runStepMap.set(rs.stepId, rs.id)
  }

  // Buscar best practices filtradas por relevância ao agente
  const allBestPractices = await prisma.bestPractice.findMany()
  const bpMap = new Map<string, string[]>()

  // Mapa de role keywords → discipline names para matching
  const roleDisciplineMap: Record<string, string[]> = {
    research: ['Researching', 'Data Analysis'],
    researcher: ['Researching', 'Data Analysis'],
    analyst: ['Data Analysis', 'Researching'],
    copywriter: ['Copywriting'],
    writer: ['Copywriting', 'Technical Writing'],
    copy: ['Copywriting'],
    editor: ['Review', 'Copywriting'],
    reviewer: ['Review'],
    review: ['Review'],
    designer: ['Image Design'],
    design: ['Image Design'],
    visual: ['Image Design'],
    publisher: ['Social Networks Publishing'],
    publish: ['Social Networks Publishing'],
    strategist: ['Strategist'],
    strategy: ['Strategist'],
    seo: ['Copywriting'],
    technical: ['Technical Writing'],
    documentation: ['Technical Writing'],
  }

  // Mapear steps por agentId para saber os formats
  const stepFormatsByAgent = new Map<string, string[]>()
  for (const s of run.squad.pipeline!.steps) {
    if (s.agentId) {
      const formats = stepFormatsByAgent.get(s.agentId) ?? []
      if (s.format && s.format !== 'markdown') {
        formats.push(s.format)
      }
      stepFormatsByAgent.set(s.agentId, formats)
    }
  }

  for (const agent of run.squad.agents) {
    const relevantBps: string[] = []

    // 1. Match por format do step (platform best practices)
    const formats = stepFormatsByAgent.get(agent.id) ?? []
    for (const format of formats) {
      // format pode ser: "instagram-feed", "blog-post", "linkedin-post", "youtube-script", etc.
      const parts = format.split('-')
      for (const bp of allBestPractices) {
        if (bp.category === 'platform') {
          // Match por platform + contentType (ex: "instagram" + "feed")
          const matchesPlatform = parts.some((p) => bp.platform?.toLowerCase() === p)
          const matchesContent = parts.some((p) => bp.contentType?.toLowerCase() === p)
          if (matchesPlatform || matchesContent) {
            relevantBps.push(`[${bp.name}]: ${bp.content}`)
          }
        }
        // Match por discipline name (ex: format "review" → discipline "Review")
        if (bp.category === 'discipline' && bp.name.toLowerCase() === format.replace(/-/g, ' ')) {
          relevantBps.push(`[${bp.name}]: ${bp.content}`)
        }
      }
    }

    // 2. Match por role do agente → disciplines relevantes
    const roleLower = agent.role.toLowerCase()
    const matchedDisciplines = new Set<string>()
    for (const [keyword, disciplines] of Object.entries(roleDisciplineMap)) {
      if (roleLower.includes(keyword)) {
        for (const d of disciplines) matchedDisciplines.add(d)
      }
    }

    for (const bp of allBestPractices) {
      if (bp.category === 'discipline' && matchedDisciplines.has(bp.name)) {
        const entry = `[${bp.name}]: ${bp.content}`
        if (!relevantBps.includes(entry)) {
          relevantBps.push(entry)
        }
      }
    }

    if (relevantBps.length > 0) {
      bpMap.set(agent.id, relevantBps)
    }
  }

  // Buscar skill instructions por agente
  const skillMap = new Map<string, string[]>()
  for (const agent of run.squad.agents) {
    const instructions = agent.skills
      .filter((s) => s.skill.implementation)
      .map((s) => `[${s.skill.name}]: ${s.skill.implementation}`)
    if (instructions.length > 0) {
      skillMap.set(agent.id, instructions)
    }
  }

  // Carregar memórias de runs anteriores
  let memories: string[] = []
  try {
    memories = run.squad.memories ? JSON.parse(run.squad.memories) : []
  } catch {
    memories = []
  }

  const startTime = Date.now()
  const input = run.input ? JSON.parse(run.input as string) : {}
  let inputText = typeof input === 'string' ? input : (input.prompt ?? input.text ?? JSON.stringify(input))

  // Garantir que o input nunca seja vazio — usar o nome/descrição do squad como contexto
  if (!inputText || inputText === '{}' || inputText.trim() === '') {
    const desc = run.squad.description ?? run.squad.name
    inputText = `Execute o squad "${run.squad.name}". Contexto: ${desc}`
  }
  const totalSteps = steps.length

  // Criar o runner com callbacks integrados ao WS e DB
  const runner = new PipelineRunner({
    onStatusChange: async (status) => {
      wsServer.emitRunStatus(runId, status, runner.getCurrentStepIndex(), totalSteps)
      await prisma.run.update({
        where: { id: runId },
        data: { status },
      }).catch(() => {})
    },

    onStepStart: (step) => {
      const agent = agentsMap.get(step.agentId)
      const runStepId = runStepMap.get(step.id) ?? step.id
      const stepIndex = steps.findIndex((s) => s.id === step.id)

      wsServer.emitStepStart(
        runId,
        step.id,
        runStepId,
        agent?.name ?? 'Agent',
        agent?.icon ?? '🤖',
        step.label,
        stepIndex,
        totalSteps,
      )

      wsServer.emitAgentStatus(runId, step.agentId, agent?.name ?? 'Agent', 'working')

      prisma.runStep.update({
        where: { id: runStepId },
        data: { status: 'running', startedAt: new Date() },
      }).catch(() => {})
    },

    onStepOutput: (step, chunk) => {
      const runStepId = runStepMap.get(step.id) ?? step.id
      wsServer.emitStepOutput(runId, runStepId, chunk)
    },

    onStepComplete: async (step, output, tokensUsed, cost) => {
      const runStepId = runStepMap.get(step.id) ?? step.id
      const agent = agentsMap.get(step.agentId)
      const elapsed = Date.now() - startTime

      wsServer.emitStepComplete(runId, runStepId, output, tokensUsed.total, cost, elapsed)
      wsServer.emitAgentStatus(runId, step.agentId, agent?.name ?? 'Agent', 'done')

      await prisma.runStep.update({
        where: { id: runStepId },
        data: {
          status: 'completed',
          output,
          tokensUsed: tokensUsed.total,
          cost,
          completedAt: new Date(),
        },
      }).catch(() => {})
    },

    onStepError: async (step, error) => {
      const runStepId = runStepMap.get(step.id) ?? step.id
      const agent = agentsMap.get(step.agentId)

      wsServer.emitStepError(runId, runStepId, error.message)
      wsServer.emitAgentStatus(runId, step.agentId, agent?.name ?? 'Agent', 'error')

      await prisma.runStep.update({
        where: { id: runStepId },
        data: { status: 'failed', completedAt: new Date() },
      }).catch(() => {})

      await prisma.runLog.create({
        data: {
          runStepId,
          level: 'error',
          message: error.message,
        },
      }).catch(() => {})
    },

    onHandoff: (fromAgentId, toAgentId) => {
      const fromAgent = agentsMap.get(fromAgentId)
      const toAgent = agentsMap.get(toAgentId)

      wsServer.emitHandoffStart(
        runId,
        { id: fromAgentId, name: fromAgent?.name ?? 'Agent', icon: fromAgent?.icon ?? '🤖' },
        { id: toAgentId, name: toAgent?.name ?? 'Agent', icon: toAgent?.icon ?? '🤖' },
        `Handoff de ${fromAgent?.name ?? 'Agent'} para ${toAgent?.name ?? 'Agent'}`,
      )

      setTimeout(() => wsServer.emitHandoffEnd(runId), 500)
    },

    onCheckpoint: async (step, previousOutput) => {
      const runStepId = runStepMap.get(step.id) ?? step.id

      // Marcar step como running
      prisma.runStep.update({
        where: { id: runStepId },
        data: { status: 'running', startedAt: new Date() },
      }).catch(() => {})

      wsServer.emitCheckpointRequest(runId, runStepId, step.label, previousOutput)

      const response = await wsServer.waitForCheckpoint(runStepId)

      // Atualizar step no DB
      prisma.runStep.update({
        where: { id: runStepId },
        data: {
          status: 'completed',
          output: `${response.action}${response.feedback ? ': ' + response.feedback : ''}`,
          completedAt: new Date(),
        },
      }).catch(() => {})

      return {
        action: response.action,
        feedback: response.feedback,
      }
    },

    onVetoFail: (step, violations) => {
      const runStepId = runStepMap.get(step.id) ?? step.id
      prisma.runLog.create({
        data: {
          runStepId,
          level: 'warn',
          message: `Veto falhou: ${violations.join('; ')}`,
        },
      }).catch(() => {})
    },
  })

  activeRunners.set(runId, runner)

  const pipelineContext: PipelineContext = {
    agents: agentsMap,
    provider: aiProvider,
    input: inputText,
    bestPractices: bpMap,
    skillInstructions: skillMap,
    memories,
  }

  try {
    const result = await runner.run(steps, pipelineContext)

    const durationMs = Date.now() - startTime
    const lastOutput = Array.from(result.outputs.values()).pop() ?? ''

    await prisma.run.update({
      where: { id: runId },
      data: {
        status: 'completed',
        totalTokens: result.totalTokens.total,
        totalCost: result.totalCost,
        completedAt: new Date(),
      },
    })

    wsServer.emitRunMetrics(runId, result.totalTokens.total, result.totalCost, durationMs)
    wsServer.emitRunComplete(runId, 'completed', result.totalTokens.total, result.totalCost, durationMs, lastOutput)

    // Gerar memórias do run e salvar no squad
    try {
      const newMemories = generateRunMemories(
        inputText,
        result.outputs,
        steps,
        agentsMap,
        result.totalTokens.total,
        result.totalCost,
        durationMs,
      )
      if (newMemories.length > 0) {
        // Manter no máximo 20 memórias (as mais recentes)
        const updatedMemories = [...memories, ...newMemories].slice(-20)
        await prisma.squad.update({
          where: { id: run.squadId },
          data: { memories: JSON.stringify(updatedMemories) },
        })
      }
    } catch {
      // Não falhar o run por causa de memórias
    }
  } catch (err) {
    const durationMs = Date.now() - startTime
    const errorMsg = err instanceof Error ? err.message : String(err)
    await failRun(runId, errorMsg, durationMs)
  } finally {
    activeRunners.delete(runId)
  }
}

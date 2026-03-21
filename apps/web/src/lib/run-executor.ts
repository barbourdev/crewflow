import { prisma } from '@/lib/db'
import { wsServer } from '@/lib/ws-server'
import { PipelineRunner, type PipelineContext, RESEARCH_TOOLS } from '@crewflow/engine'
import { createProvider } from '@crewflow/ai'
import type { AgentDefinition, StepDefinition, TaskDefinition } from '@crewflow/shared'

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
    `[${date}] Run com input "${input.slice(0, 100)}${input.length > 100 ? '...' : ''}" — ${stepsCompleted}/${steps.length} steps concluidos, ${totalTokens} tokens, $${totalCost.toFixed(4)}, ${Math.round(durationMs / 1000)}s`
  )

  // Para cada step, extrair aprendizado do output
  for (const step of steps) {
    const output = outputs.get(step.id)
    if (!output) continue

    const agent = agents.get(step.agentId)
    const agentName = agent?.name ?? 'Agent'

    // Salvar um resumo curto de cada output para referencia futura
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
  wsServer.cancelPendingWaiters(runId)

  await prisma.run.update({
    where: { id: runId },
    data: {
      status: 'failed',
      completedAt: new Date(),
      duration: durationMs,
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
              tasks: { orderBy: { order: 'asc' } },
            },
          },
          pipeline: {
            include: {
              steps: { orderBy: { order: 'asc' } },
            },
          },
          data: true,
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
    await failRun(runId, 'Run nao encontrado ou sem pipeline configurada.')
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
    await failRun(runId, 'Nenhuma API key configurada. Va em Settings para adicionar uma chave da Anthropic ou OpenAI.')
    return
  }

  const aiProvider = createProvider(provider, apiKeys[provider]!)

  // Verbose logging preference
  let verboseLogging = false
  try {
    const prefs = JSON.parse(user.preferences || '{}')
    verboseLogging = prefs.verboseLogging === true
  } catch { /* */ }

  if (verboseLogging) {
    wsServer.emitVerboseLog(runId, 'model', `Provider: ${provider}`, undefined, { provider })
    wsServer.emitVerboseLog(runId, 'context', `Squad: ${run.squad.name} — ${run.squad.agents.length} agents, ${run.squad.pipeline.steps.length} steps`)
  }

  // ================================================================
  // MAPEAR AGENTES DO DB → AgentDefinition (com persona rica + tasks)
  // ================================================================
  const agentsMap = new Map<string, AgentDefinition>()
  for (const agent of run.squad.agents) {
    const persona = agent.persona ? JSON.parse(agent.persona as string) : {}
    const voiceGuidance = agent.voiceGuidance ? JSON.parse(agent.voiceGuidance as string) : undefined
    const antiPatterns = agent.antiPatterns ? JSON.parse(agent.antiPatterns as string) : undefined
    const qualityCriteria = agent.qualityCriteria ? JSON.parse(agent.qualityCriteria as string) : undefined
    const integration = agent.integration ? JSON.parse(agent.integration as string) : undefined

    // Mapear tasks do agente
    const tasks: TaskDefinition[] = agent.tasks.map((t: any) => ({
      id: t.id,
      agentId: t.agentId,
      name: t.name,
      description: t.description,
      order: t.order,
      skills: t.skills ? JSON.parse(t.skills as string) : [],
      inputSource: t.inputSource ?? undefined,
      outputTarget: t.outputTarget ?? undefined,
      objective: t.objective ?? undefined,
      process: t.process ?? undefined,
      outputFormat: t.outputFormat ?? undefined,
      outputExample: t.outputExample ?? undefined,
      qualityCriteria: t.qualityCriteria ? JSON.parse(t.qualityCriteria as string) : [],
      vetoConditions: t.vetoConditions ? JSON.parse(t.vetoConditions as string) : [],
    }))

    agentsMap.set(agent.id, {
      id: agent.id,
      name: agent.name,
      title: agent.title ?? undefined,
      icon: agent.icon ?? '',
      role: agent.role,
      execution: (agent.execution as 'inline' | 'subagent') ?? 'inline',
      persona: {
        role: persona.role ?? persona.role_definition ?? agent.role,
        identity: persona.identity ?? '',
        communicationStyle: persona.communicationStyle ?? persona.communication_style ?? '',
        principles: persona.principles ?? [],
      },
      principles: agent.principles ?? undefined,
      voiceGuidance: voiceGuidance && (voiceGuidance.alwaysUse || voiceGuidance.neverUse || voiceGuidance.toneRules)
        ? {
            alwaysUse: voiceGuidance.alwaysUse ?? [],
            neverUse: voiceGuidance.neverUse ?? [],
            toneRules: voiceGuidance.toneRules ?? [],
          }
        : undefined,
      operationalFramework: persona.operationalFramework ?? persona.operational_framework
        ? (typeof (persona.operationalFramework ?? persona.operational_framework) === 'string'
          ? (persona.operationalFramework ?? persona.operational_framework)
          : JSON.stringify(persona.operationalFramework ?? persona.operational_framework))
        : undefined,
      outputExamples: persona.outputExamples ?? persona.output_examples,
      antiPatterns: Array.isArray(antiPatterns?.neverDo)
        ? antiPatterns.neverDo
        : (antiPatterns ?? persona.antiPatterns ?? persona.anti_patterns),
      qualityCriteria: Array.isArray(qualityCriteria)
        ? qualityCriteria
        : (persona.qualityCriteria ?? persona.quality_criteria),
      integration: integration && (integration.readsFrom || integration.writesTo)
        ? {
            readsFrom: integration.readsFrom ?? [],
            writesTo: integration.writesTo ?? [],
          }
        : undefined,
      skills: agent.skills.map((s: any) => s.skill.name),
      tasks,
      position: { col: agent.positionCol, row: agent.positionRow },
    })
  }

  // ================================================================
  // MAPEAR STEPS DO DB → StepDefinition (com instructions, format, skills)
  // ================================================================
  const steps: StepDefinition[] = run.squad.pipeline.steps.map((s: any) => ({
    id: s.id,
    agentId: s.agentId ?? '',
    order: s.order,
    label: s.label,
    execution: s.type as StepDefinition['execution'],
    instructions: s.instructions ?? undefined,
    contextLoading: s.contextLoading ? JSON.parse(s.contextLoading as string) : undefined,
    outputExample: s.outputExample ?? undefined,
    formatRef: s.formatRef ?? undefined,
    skillRefs: s.skillRefs ? JSON.parse(s.skillRefs as string) : undefined,
    modelTier: s.modelTier ?? undefined,
    vetoConditions: s.vetoConditions ? JSON.parse(s.vetoConditions as string) : undefined,
    onReject: s.onReject && s.onReject !== 'retry' ? s.onReject : undefined,
  }))

  if (steps.length === 0) {
    await failRun(runId, 'Pipeline nao tem steps com agentes configurados.')
    return
  }

  // Mapear RunStep IDs (stepId -> runStepId) para TODOS os steps (incluindo checkpoints)
  const runStepMap = new Map<string, string>()
  for (const rs of run.steps) {
    runStepMap.set(rs.stepId, rs.id)
  }

  // ================================================================
  // BEST PRACTICES — filtrar por relevancia ao agente + format
  // ================================================================
  const allBestPractices = await prisma.bestPractice.findMany()
  const bpMap = new Map<string, string[]>()

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
      const parts = format.split('-')
      for (const bp of allBestPractices) {
        if (bp.category === 'platform') {
          const matchesPlatform = parts.some((p) => bp.platform?.toLowerCase() === p)
          const matchesContent = parts.some((p) => bp.contentType?.toLowerCase() === p)
          if (matchesPlatform || matchesContent) {
            relevantBps.push(`[${bp.name}]: ${bp.content}`)
          }
        }
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

  // ================================================================
  // SKILL INSTRUCTIONS — usar campo `instructions` (o SKILL.md inteiro)
  // ================================================================
  const skillMap = new Map<string, string[]>()
  const skillInstructionsByName = new Map<string, string>()

  for (const agent of run.squad.agents) {
    const instructions = agent.skills
      .filter((s: any) => s.skill.instructions || s.skill.implementation)
      .map((s: any) => {
        // Preferir instructions (campo novo rico) sobre implementation (legado)
        const content = s.skill.instructions || s.skill.implementation || ''
        return `[${s.skill.name}]: ${content}`
      })
    if (instructions.length > 0) {
      skillMap.set(agent.id, instructions)
    }

    // Indexar por nome para step-level injection
    for (const s of agent.skills) {
      const content = s.skill.instructions || s.skill.implementation
      if (content) {
        skillInstructionsByName.set(s.skill.name, content)
      }
    }
  }

  // ================================================================
  // FORMAT PRACTICES — mapa de formatRef → best practice content
  // ================================================================
  const formatPractices = new Map<string, string>()
  for (const bp of allBestPractices) {
    if (bp.category === 'platform' && bp.platform && bp.contentType) {
      const key = `${bp.platform}-${bp.contentType}`
      formatPractices.set(key, bp.content)
    }
  }

  // ================================================================
  // SQUAD DATA — dados de referencia (quality-criteria, tone-of-voice, etc.)
  // ================================================================
  const squadData: string[] = run.squad.data.map((d: any) =>
    `[${d.name}]: ${d.content}`
  )

  // ================================================================
  // MEMORIAS de runs anteriores
  // ================================================================
  let memories: string[] = []
  try {
    memories = run.squad.memories ? JSON.parse(run.squad.memories) : []
  } catch {
    memories = []
  }

  const startTime = Date.now()
  const input = run.input ? JSON.parse(run.input as string) : {}
  let inputText = typeof input === 'string' ? input : (input.prompt ?? input.text ?? JSON.stringify(input))

  if (!inputText || inputText === '{}' || inputText.trim() === '') {
    const desc = run.squad.description ?? run.squad.name
    inputText = `Execute o squad "${run.squad.name}". Contexto: ${desc}`
  }
  const totalSteps = steps.length

  // ================================================================
  // CRIAR RUNNER COM CALLBACKS
  // ================================================================
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
        agent?.icon ?? '',
        step.label,
        stepIndex,
        totalSteps,
      )

      wsServer.emitAgentStatus(runId, step.agentId, agent?.name ?? 'Agent', 'working')

      if (verboseLogging && agent) {
        const agentBps = bpMap.get(step.agentId)
        const agentSkills = skillMap.get(step.agentId)
        wsServer.emitVerboseLog(runId, 'context',
          `Agent "${agent.name}" (${agent.role}) — ${agent.tasks.length} tasks, ${agentSkills?.length ?? 0} skills, ${agentBps?.length ?? 0} best practices`,
          runStepId,
          { execution: step.execution, modelTier: step.modelTier, agentId: step.agentId },
        )
      }

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

      if (verboseLogging) {
        wsServer.emitVerboseLog(runId, 'tokens',
          `Input: ${tokensUsed.input} | Output: ${tokensUsed.output} | Total: ${tokensUsed.total}`,
          runStepId,
          { input: tokensUsed.input, output: tokensUsed.output, total: tokensUsed.total, cost },
        )
        wsServer.emitVerboseLog(runId, 'timing',
          `Step "${step.label}" completed in ${((elapsed) / 1000).toFixed(1)}s — $${cost.toFixed(4)}`,
          runStepId,
          { elapsedMs: elapsed, cost },
        )
      }

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
        { id: fromAgentId, name: fromAgent?.name ?? 'Agent', icon: fromAgent?.icon ?? '' },
        { id: toAgentId, name: toAgent?.name ?? 'Agent', icon: toAgent?.icon ?? '' },
        `Handoff de ${fromAgent?.name ?? 'Agent'} para ${toAgent?.name ?? 'Agent'}`,
      )

      setTimeout(() => wsServer.emitHandoffEnd(runId), 500)
    },

    onCheckpoint: async (step, previousOutput, checkpointRequest) => {
      const runStepId = runStepMap.get(step.id) ?? step.id

      prisma.runStep.update({
        where: { id: runStepId },
        data: { status: 'running', startedAt: new Date() },
      }).catch(() => {})

      // Emitir checkpoint com tipo, pergunta e opcoes
      wsServer.emitCheckpointRequest(
        runId,
        runStepId,
        step.label,
        previousOutput,
        checkpointRequest?.type ?? 'approval',
        checkpointRequest?.question,
        checkpointRequest?.options,
        checkpointRequest?.instructions,
      )

      const response = await wsServer.waitForCheckpoint(runStepId)

      const outputText = response.selected
        ? `Selecionado: ${response.selected}${response.feedback ? ' — ' + response.feedback : ''}`
        : `${response.action}${response.feedback ? ': ' + response.feedback : ''}`

      prisma.runStep.update({
        where: { id: runStepId },
        data: {
          status: 'completed',
          output: outputText,
          completedAt: new Date(),
        },
      }).catch(() => {})

      return {
        action: response.action,
        feedback: response.feedback,
        selected: response.selected,
      }
    },

    onHumanInputRequest: async (request) => {
      const runStepId = runStepMap.get(request.stepId) ?? request.stepId

      wsServer.emitHumanInputRequest(runId, runStepId, request.agentName, request.output)

      const response = await wsServer.waitForHumanInput(runStepId)

      await prisma.runLog.create({
        data: {
          runStepId,
          level: 'info',
          message: `Human input: ${response.message}`,
        },
      }).catch(() => {})

      return { message: response.message }
    },

    onReviewReject: async (step, output, reason) => {
      const runStepId = runStepMap.get(step.id) ?? step.id
      const agent = agentsMap.get(step.agentId)

      wsServer.emitReviewRejectRequest(runId, runStepId, agent?.name ?? 'Review Agent', output, reason)

      const response = await wsServer.waitForReviewRejectResponse(runStepId)

      await prisma.runLog.create({
        data: {
          runStepId,
          level: 'info',
          message: `Review decision: ${response.action}${response.feedback ? ' - ' + response.feedback : ''}`,
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

      if (verboseLogging) {
        wsServer.emitVerboseLog(runId, 'veto',
          `Veto violations: ${violations.join(' | ')}`,
          runStepId,
          { violations },
        )
      }
    },

    onToolCall: (stepId, toolName, input, result) => {
      const runStepId = runStepMap.get(stepId) ?? stepId
      console.log(`[ENGINE] Tool "${toolName}" called with:`, JSON.stringify(input).slice(0, 100))

      if (verboseLogging) {
        wsServer.emitVerboseLog(runId, 'context',
          `Tool: ${toolName}(${JSON.stringify(input).slice(0, 100)}) → ${result.slice(0, 150)}`,
          runStepId,
          { toolName, input, resultPreview: result.slice(0, 200) },
        )
      }
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
    squadData: squadData.length > 0 ? squadData : undefined,
    formatPractices,
    skillInstructionsByName,
    tools: RESEARCH_TOOLS,
  }

  try {
    const result = await runner.run(steps, pipelineContext)

    const durationMs = Date.now() - startTime
    const wasCancelled = runner.getStatus() === 'cancelled'
    const finalStatus = wasCancelled ? 'cancelled' : 'completed'

    // Liberar qualquer waiter pendente
    wsServer.cancelPendingWaiters(runId)

    await prisma.run.update({
      where: { id: runId },
      data: {
        status: finalStatus,
        totalTokens: result.totalTokens.total,
        totalCost: result.totalCost,
        duration: durationMs,
        completedAt: new Date(),
      },
    })

    wsServer.emitRunMetrics(runId, result.totalTokens.total, result.totalCost, durationMs)
    wsServer.emitRunComplete(runId, finalStatus, result.totalTokens.total, result.totalCost, durationMs)

    // Gerar memorias do run e salvar no squad
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
        const updatedMemories = [...memories, ...newMemories].slice(-20)
        await prisma.squad.update({
          where: { id: run.squadId },
          data: { memories: JSON.stringify(updatedMemories) },
        })
      }
    } catch {
      // Nao falhar o run por causa de memorias
    }
  } catch (err) {
    const durationMs = Date.now() - startTime
    const errorMsg = err instanceof Error ? err.message : String(err)
    await failRun(runId, errorMsg, durationMs)
  } finally {
    activeRunners.delete(runId)
  }
}

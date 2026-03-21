import type { RunStatus, StepDefinition, AgentDefinition } from '@crewflow/shared'
import type { AIProvider, AITool } from '@crewflow/ai'
import { AgentExecutor } from './agent-executor'
import { HandoffManager } from './handoff-manager'
import { VetoChecker } from './veto-checker'
import { CheckpointHandler, type CheckpointResponse, type CheckpointRequest } from './checkpoint-handler'

export interface HumanInputRequest {
  stepId: string
  agentName: string
  output: string
}

export interface HumanInputResponse {
  message: string
}

export interface PipelineCallbacks {
  onStepStart?: (step: StepDefinition) => void
  onStepOutput?: (step: StepDefinition, chunk: string) => void
  onStepComplete?: (step: StepDefinition, output: string, tokensUsed: { input: number; output: number; total: number }, cost: number) => void
  onStepError?: (step: StepDefinition, error: Error) => void
  onStatusChange?: (status: RunStatus) => void
  onHandoff?: (fromAgentId: string, toAgentId: string) => void
  onCheckpoint?: (step: StepDefinition, previousOutput: string, request: CheckpointRequest) => Promise<CheckpointResponse>
  onVetoFail?: (step: StepDefinition, violations: string[]) => void
  /** Chamado quando o agente faz uma pergunta e espera resposta do usuario */
  onHumanInputRequest?: (request: HumanInputRequest) => Promise<HumanInputResponse>
  /** Chamado quando um agente de review rejeita o output - permite usuario decidir */
  onReviewReject?: (step: StepDefinition, output: string, reason: string) => Promise<CheckpointResponse>
  /** Chamado quando uma task individual inicia (para tracking granular) */
  onTaskStart?: (stepId: string, taskId: string, taskName: string, taskOrder: number, totalTasks: number) => void
  /** Chamado quando uma task individual completa */
  onTaskComplete?: (stepId: string, taskId: string, output: string, tokensUsed: number, cost: number) => void
  /** Chamado quando o agente usa uma tool (web_search, web_fetch, etc.) */
  onToolCall?: (stepId: string, toolName: string, input: Record<string, unknown>, result: string) => void
}

export interface PipelineContext {
  agents: Map<string, AgentDefinition>
  provider: AIProvider
  input: string
  bestPractices?: Map<string, string[]>
  skillInstructions?: Map<string, string[]>
  memories?: string[]
  /** Dados de referencia do squad (quality-criteria, tone-of-voice, etc.) */
  squadData?: string[]
  /** Best practices por formatRef (ex: "instagram-feed" -> conteudo) */
  formatPractices?: Map<string, string>
  /** Skill instructions por nome (para injection per-step) */
  skillInstructionsByName?: Map<string, string>
  /** Tools disponiveis para os agentes (ex: web_search, web_fetch) */
  tools?: AITool[]
}

export class PipelineRunner {
  private status: RunStatus = 'queued'
  private currentStepIndex = 0
  private callbacks: PipelineCallbacks
  private agentExecutor: AgentExecutor
  private handoffManager: HandoffManager
  private vetoChecker: VetoChecker
  private checkpointHandler: CheckpointHandler
  private pausePromise: { resolve: () => void } | null = null
  private cancelled = false

  constructor(callbacks: PipelineCallbacks = {}) {
    this.callbacks = callbacks
    this.agentExecutor = new AgentExecutor()
    this.handoffManager = new HandoffManager()
    this.vetoChecker = new VetoChecker()
    this.checkpointHandler = new CheckpointHandler(
      callbacks.onCheckpoint
        ? (step, request) => callbacks.onCheckpoint!(step, '', request)
        : undefined,
    )
  }

  getStatus(): RunStatus {
    return this.status
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex
  }

  async run(steps: StepDefinition[], context: PipelineContext): Promise<{
    outputs: Map<string, string>
    totalTokens: { input: number; output: number; total: number }
    totalCost: number
  }> {
    this.setStatus('running')
    this.cancelled = false

    const outputs = new Map<string, string>()
    const totalTokens = { input: 0, output: 0, total: 0 }
    let totalCost = 0
    let lastOutput: string | undefined
    let lastAgentStepId: string | undefined

    const sortedSteps = [...steps].sort((a, b) => a.order - b.order)

    let i = 0
    while (i < sortedSteps.length) {
      if (this.cancelled) break

      await this.waitIfPaused()
      if (this.cancelled) break

      const step = sortedSteps[i]!
      this.currentStepIndex = i

      // ================================================================
      // CHECKPOINT — pausa e espera aprovacao do usuario
      // ================================================================
      if (step.execution === 'checkpoint') {
        this.callbacks.onStepStart?.(step)

        if (this.callbacks.onCheckpoint) {
          // Parsear instrucoes do step para extrair tipo, pergunta e opcoes
          const checkpointRequest = CheckpointHandler.parseStepInstructions(step)
          const response = await this.callbacks.onCheckpoint(step, lastOutput ?? '', checkpointRequest)

          if (response.action === 'approve') {
            // Se o usuario selecionou algo, incorporar no contexto para o proximo step
            const checkpointOutput = response.selected
              ? `Escolha do usuario: ${response.selected}${response.feedback ? `\nObservacao: ${response.feedback}` : ''}`
              : response.feedback
                ? `Aprovado com observacao: ${response.feedback}`
                : 'Aprovado'

            if (response.selected || response.feedback) {
              // Injetar escolha/feedback no input do pipeline para o proximo agente usar
              context.input = `${context.input}\n\n--- DECISAO DO USUARIO (${step.label}) ---\n${checkpointOutput}`
              lastOutput = (lastOutput ?? '') + `\n\n--- ${step.label} ---\n${checkpointOutput}`
            }

            this.callbacks.onStepComplete?.(step, checkpointOutput, { input: 0, output: 0, total: 0 }, 0)
            i++
            continue
          }

          if (response.action === 'redo') {
            const targetLabel = step.onReject
            const targetIndex = targetLabel
              ? sortedSteps.findIndex((s) => s.label === targetLabel || s.id === targetLabel)
              : this.findPreviousAgentStep(sortedSteps, i)

            if (targetIndex >= 0) {
              this.callbacks.onStepComplete?.(step, `Rejeitado — voltando para "${sortedSteps[targetIndex]!.label}"`, { input: 0, output: 0, total: 0 }, 0)

              if (response.feedback) {
                context.input = `${context.input}\n\n--- FEEDBACK DA REVISAO ---\n${response.feedback}\n\nRefaca levando em conta o feedback acima.`
              }

              i = targetIndex
              continue
            }
          }

          this.callbacks.onStepComplete?.(step, `Ajustado: ${response.feedback ?? ''}`, { input: 0, output: 0, total: 0 }, 0)
        } else {
          this.callbacks.onStepComplete?.(step, 'Auto-aprovado', { input: 0, output: 0, total: 0 }, 0)
        }

        i++
        continue
      }

      // ================================================================
      // AGENT STEP — executa o agente (com task decomposition)
      // ================================================================
      const agent = context.agents.get(step.agentId)
      if (!agent) {
        const error = new Error(`Agente nao encontrado: ${step.agentId}`)
        this.callbacks.onStepError?.(step, error)
        this.setStatus('failed')
        throw error
      }

      this.callbacks.onStepStart?.(step)

      // Handoff do agente anterior
      if (lastOutput && lastAgentStepId) {
        const prevStep = sortedSteps.find((s) => s.id === lastAgentStepId)
        if (prevStep && prevStep.agentId !== step.agentId) {
          this.callbacks.onHandoff?.(prevStep.agentId, step.agentId)
          await this.handoffManager.handoff(
            prevStep.agentId,
            agent.name,
            step.agentId,
            lastOutput,
          )
        }
      }

      try {
        const taskCount = agent.tasks.length
        console.log(`[ENGINE] Step ${i + 1}/${sortedSteps.length}: executing agent "${agent.name}" for "${step.label}"${taskCount > 0 ? ` (${taskCount} tasks)` : ''}`)

        // Montar best practices do step (agent-level + format injection)
        const stepBestPractices = [...(context.bestPractices?.get(agent.id) ?? [])]
        if (step.formatRef && context.formatPractices) {
          const formatBp = context.formatPractices.get(step.formatRef)
          if (formatBp) {
            stepBestPractices.push(`[Format: ${step.formatRef}]: ${formatBp}`)
          }
        }

        // Montar skill instructions do step (agent-level + step-level injection)
        const stepSkillInstructions = [...(context.skillInstructions?.get(agent.id) ?? [])]
        if (step.skillRefs && context.skillInstructionsByName) {
          for (const skillName of step.skillRefs) {
            const skillInstr = context.skillInstructionsByName.get(skillName)
            if (skillInstr && !stepSkillInstructions.includes(skillInstr)) {
              stepSkillInstructions.push(`[${skillName}]: ${skillInstr}`)
            }
          }
        }

        // Emitir task events para tracking granular
        if (taskCount > 0) {
          for (const task of agent.tasks) {
            this.callbacks.onTaskStart?.(step.id, task.id, task.name, task.order, taskCount)
          }
        }

        // Context loading — carregar dados especificos do step
        const stepContextData = [...(context.squadData ?? [])]
        if (step.contextLoading && step.contextLoading.length > 0 && context.squadData) {
          // Filtrar squad data que corresponde ao contextLoading
          const filtered = context.squadData.filter((d) =>
            step.contextLoading!.some((cl) => d.toLowerCase().includes(cl.toLowerCase()))
          )
          if (filtered.length > 0) {
            // Substituir pelo subset filtrado (mais focado)
            stepContextData.length = 0
            stepContextData.push(...filtered)
          }
        }

        // Model tier → model override
        const modelOverride = this.resolveModelTier(step.modelTier, context.provider)

        const result = await this.agentExecutor.execute(agent, context.input, {
          provider: context.provider,
          previousOutput: lastOutput,
          bestPractices: stepBestPractices.length > 0 ? stepBestPractices : undefined,
          skillInstructions: stepSkillInstructions.length > 0 ? stepSkillInstructions : undefined,
          memories: context.memories,
          stepInstructions: step.instructions,
          contextData: stepContextData.length > 0 ? stepContextData : undefined,
          outputExample: step.outputExample,
          onStream: (chunk) => this.callbacks.onStepOutput?.(step, chunk),
          // Tools — web_search, web_fetch, etc.
          tools: context.tools,
          onToolCall: this.callbacks.onToolCall
            ? (toolName, input, result) => this.callbacks.onToolCall!(step.id, toolName, input, result)
            : undefined,
          // Model tier override
          modelOverride,
          // Inline questions — agente pode perguntar ao usuario mid-execution
          onInlineQuestion: this.callbacks.onHumanInputRequest
            ? async (question: string, agentName: string) => {
                const response = await this.callbacks.onHumanInputRequest!({
                  stepId: step.id,
                  agentName,
                  output: question,
                })
                return response.message
              }
            : undefined,
        })

        console.log(`[ENGINE] Step ${i + 1}: agent "${agent.name}" completed. Output length: ${result.content.length}, tokens: ${result.tokensUsed.total}`)

        // Veto check — se falhar, redo o step (max 1 retry)
        if (step.vetoConditions && step.vetoConditions.length > 0) {
          const vetoResult = await this.vetoChecker.check(result.content, step.vetoConditions)
          if (!vetoResult.passed) {
            this.callbacks.onVetoFail?.(step, vetoResult.violations)

            // Se tem onReject, voltar para o step alvo
            if (step.onReject) {
              const targetIndex = sortedSteps.findIndex((s) => s.label === step.onReject || s.id === step.onReject)
              if (targetIndex >= 0) {
                context.input = `${context.input}\n\n--- VETO FAILED ---\nViolacoes: ${vetoResult.violations.join('; ')}\n\nRefaca corrigindo os problemas acima.`
                this.callbacks.onStepComplete?.(step, result.content, result.tokensUsed, result.cost)
                i = targetIndex
                continue
              }
            }
          }
        }

        // Caso normal - step completo
        outputs.set(step.id, result.content)
        lastOutput = result.content
        lastAgentStepId = step.id
        totalTokens.input += result.tokensUsed.input
        totalTokens.output += result.tokensUsed.output
        totalTokens.total += result.tokensUsed.total
        totalCost += result.cost

        this.callbacks.onStepComplete?.(step, result.content, result.tokensUsed, result.cost)
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error(`[ENGINE] Step ${i + 1}: ERROR - ${error.message}`)
        this.callbacks.onStepError?.(step, error)
        this.setStatus('failed')
        throw error
      }

      i++
    }

    if (!this.cancelled) {
      this.setStatus('completed')
    }

    return { outputs, totalTokens, totalCost }
  }

  pause(): void {
    if (this.status === 'running') {
      this.setStatus('paused')
    }
  }

  resume(): void {
    if (this.status === 'paused') {
      this.setStatus('running')
      if (this.pausePromise) {
        this.pausePromise.resolve()
        this.pausePromise = null
      }
    }
  }

  cancel(): void {
    this.cancelled = true
    this.setStatus('cancelled')
    if (this.pausePromise) {
      this.pausePromise.resolve()
      this.pausePromise = null
    }
  }

  private setStatus(status: RunStatus): void {
    this.status = status
    this.callbacks.onStatusChange?.(status)
  }

  private waitIfPaused(): Promise<void> {
    if (this.status !== 'paused') return Promise.resolve()
    return new Promise<void>((resolve) => {
      this.pausePromise = { resolve }
    })
  }

  /**
   * Resolve model tier para um model ID concreto.
   * fast → modelo mais barato (haiku/gpt-4o-mini)
   * powerful → modelo padrao (sonnet/gpt-4o)
   * undefined → usa padrao do provider
   */
  private resolveModelTier(tier: string | undefined, _provider: AIProvider): string | undefined {
    if (!tier) return undefined

    const MODEL_TIERS: Record<string, Record<string, string>> = {
      fast: {
        anthropic: 'claude-haiku-4-5-20251001',
        openai: 'gpt-4o-mini',
      },
      powerful: {
        anthropic: 'claude-sonnet-4-20250514',
        openai: 'gpt-4o',
      },
    }

    const tierModels = MODEL_TIERS[tier.toLowerCase()]
    if (!tierModels) return undefined

    // Detectar provider pelo nome da classe
    const providerName = _provider.constructor.name.toLowerCase()
    if (providerName.includes('anthropic')) return tierModels.anthropic
    if (providerName.includes('openai')) return tierModels.openai

    return undefined
  }

  private findPreviousAgentStep(steps: StepDefinition[], currentIndex: number): number {
    for (let j = currentIndex - 1; j >= 0; j--) {
      if (steps[j]!.execution !== 'checkpoint') {
        return j
      }
    }
    return -1
  }
}

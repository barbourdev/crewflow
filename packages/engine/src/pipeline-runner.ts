import type { RunStatus, StepDefinition, AgentDefinition } from '@crewflow/shared'
import type { AIProvider } from '@crewflow/ai'
import { AgentExecutor } from './agent-executor'
import { HandoffManager } from './handoff-manager'
import { VetoChecker } from './veto-checker'
import { CheckpointHandler, type CheckpointResponse } from './checkpoint-handler'
import { analyzeOutput } from './output-analyzer'

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
  onCheckpoint?: (step: StepDefinition, previousOutput: string) => Promise<CheckpointResponse>
  onVetoFail?: (step: StepDefinition, violations: string[]) => void
  /** Chamado quando o agente faz uma pergunta e espera resposta do usuario */
  onHumanInputRequest?: (request: HumanInputRequest) => Promise<HumanInputResponse>
  /** Chamado quando um agente de review rejeita o output - permite usuario decidir */
  onReviewReject?: (step: StepDefinition, output: string, reason: string) => Promise<CheckpointResponse>
}

export interface PipelineContext {
  agents: Map<string, AgentDefinition>
  provider: AIProvider
  input: string
  bestPractices?: Map<string, string[]>
  skillInstructions?: Map<string, string[]>
  memories?: string[]
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
        ? (step) => callbacks.onCheckpoint!(step, '')
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
      // CHECKPOINT — pausa e espera aprovação do usuário
      // ================================================================
      if (step.execution === 'checkpoint') {
        this.callbacks.onStepStart?.(step)

        if (this.callbacks.onCheckpoint) {
          const response = await this.callbacks.onCheckpoint(step, lastOutput ?? '')

          if (response.action === 'approve') {
            this.callbacks.onStepComplete?.(step, 'Aprovado', { input: 0, output: 0, total: 0 }, 0)
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
                context.input = `${context.input}\n\n--- FEEDBACK DA REVISÃO ---\n${response.feedback}\n\nRefaça levando em conta o feedback acima.`
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
      // AGENT STEP — executa o agente
      // ================================================================
      const agent = context.agents.get(step.agentId)
      if (!agent) {
        const error = new Error(`Agente não encontrado: ${step.agentId}`)
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
        console.log(`[ENGINE] Step ${i}/${sortedSteps.length}: executing agent "${agent.name}" for "${step.label}"`)

        const result = await this.agentExecutor.execute(agent, context.input, {
          provider: context.provider,
          previousOutput: lastOutput,
          bestPractices: context.bestPractices?.get(agent.id),
          skillInstructions: context.skillInstructions?.get(agent.id),
          memories: context.memories,
          onStream: (chunk) => this.callbacks.onStepOutput?.(step, chunk),
        })

        console.log(`[ENGINE] Step ${i}: agent "${agent.name}" completed. Output length: ${result.content.length}, tokens: ${result.tokensUsed.total}`)

        // Veto check
        if (step.vetoConditions && step.vetoConditions.length > 0) {
          const vetoResult = await this.vetoChecker.check(result.content, step.vetoConditions)
          if (!vetoResult.passed) {
            this.callbacks.onVetoFail?.(step, vetoResult.violations)
          }
        }

        // ============================================================
        // ANALYZE OUTPUT — detectar perguntas e rejeicoes
        // DESABILITADO: regex gera falsos positivos. Sera substituido
        // por system prompt com marcador [HUMAN_INPUT_REQUIRED]
        // ============================================================
        // const analysis = analyzeOutput(result.content)
        // console.log(`[ENGINE] Step ${i}: output analysis - needsHumanInput: ${analysis.needsHumanInput}, isRejection: ${analysis.isRejection}`)

        // TODO: Caso 1 - Agente fez pergunta ao usuario (desabilitado - regex gera falsos positivos)
        // Sera reabilitado com system prompt + marcador [HUMAN_INPUT_REQUIRED]
        // Infraestrutura pronta: onHumanInputRequest callback, WS events, terminal inline input

        // TODO: Caso 2 - Agente de review rejeitou (desabilitado - regex gera falsos positivos)
        // Sera reabilitado com system prompt + marcador [REVIEW_REJECT]
        // Infraestrutura pronta: onReviewReject callback, WS events, terminal inline buttons

        // Caso normal - step completo sem interacao
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
        console.error(`[ENGINE] Step ${i}: ERROR - ${error.message}`)
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

  private findPreviousAgentStep(steps: StepDefinition[], currentIndex: number): number {
    for (let j = currentIndex - 1; j >= 0; j--) {
      if (steps[j]!.execution !== 'checkpoint') {
        return j
      }
    }
    return -1
  }
}

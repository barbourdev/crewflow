import type { RunStatus, StepDefinition } from '@crewflow/shared'

export interface PipelineRunnerOptions {
  onStepStart?: (step: StepDefinition) => void
  onStepComplete?: (step: StepDefinition, output: string) => void
  onStepError?: (step: StepDefinition, error: Error) => void
  onStatusChange?: (status: RunStatus) => void
  onCheckpoint?: (step: StepDefinition) => Promise<{ action: string; feedback?: string }>
}

export class PipelineRunner {
  private status: RunStatus = 'queued'
  private currentStepIndex = 0
  private options: PipelineRunnerOptions

  constructor(options: PipelineRunnerOptions = {}) {
    this.options = options
  }

  getStatus(): RunStatus {
    return this.status
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex
  }

  // TODO: Implementar na Etapa 3
  async run(_steps: StepDefinition[]): Promise<void> {
    this.status = 'running'
    this.options.onStatusChange?.(this.status)
  }

  pause(): void {
    if (this.status === 'running') {
      this.status = 'paused'
      this.options.onStatusChange?.(this.status)
    }
  }

  resume(): void {
    if (this.status === 'paused') {
      this.status = 'running'
      this.options.onStatusChange?.(this.status)
    }
  }

  cancel(): void {
    this.status = 'failed'
    this.options.onStatusChange?.(this.status)
  }
}

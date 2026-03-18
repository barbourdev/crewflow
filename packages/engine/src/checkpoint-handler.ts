import type { StepDefinition } from '@crewflow/shared'

export type CheckpointAction = 'approve' | 'adjust' | 'redo'

export interface CheckpointResponse {
  action: CheckpointAction
  feedback?: string
}

export type CheckpointResolver = (step: StepDefinition) => Promise<CheckpointResponse>

export class CheckpointHandler {
  private resolver: CheckpointResolver

  constructor(resolver?: CheckpointResolver) {
    // Default: auto-approve
    this.resolver = resolver ?? (() => Promise.resolve({ action: 'approve' }))
  }

  setResolver(resolver: CheckpointResolver): void {
    this.resolver = resolver
  }

  async waitForResponse(step: StepDefinition): Promise<CheckpointResponse> {
    return this.resolver(step)
  }
}

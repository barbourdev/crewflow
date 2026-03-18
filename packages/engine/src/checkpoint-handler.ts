import type { StepDefinition } from '@crewflow/shared'

export class CheckpointHandler {
  // TODO: Implementar
  async waitForResponse(
    _step: StepDefinition,
  ): Promise<{ action: string; feedback?: string }> {
    return { action: 'approve' }
  }
}

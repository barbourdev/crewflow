import type { AgentDefinition } from '@crewflow/shared'

export interface AgentExecutorOptions {
  onStream?: (chunk: string) => void
}

export class AgentExecutor {
  // TODO: Implementar
  async execute(
    _agent: AgentDefinition,
    _input: string,
    _options?: AgentExecutorOptions,
  ): Promise<string> {
    return ''
  }

  buildContext(_agent: AgentDefinition, _bestPractices?: string, _skillInstructions?: string): string {
    return ''
  }
}

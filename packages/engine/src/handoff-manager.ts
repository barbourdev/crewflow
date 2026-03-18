export interface HandoffContext {
  fromAgentId: string
  fromAgentName: string
  toAgentId: string
  output: string
  summary: string
}

export class HandoffManager {
  private history: HandoffContext[] = []

  async handoff(
    fromAgentId: string,
    fromAgentName: string,
    toAgentId: string,
    output: string,
  ): Promise<HandoffContext> {
    const summary = this.summarize(output)

    const context: HandoffContext = {
      fromAgentId,
      fromAgentName,
      toAgentId,
      output,
      summary,
    }

    this.history.push(context)
    return context
  }

  getHistory(): HandoffContext[] {
    return this.history
  }

  getLastOutput(): string | undefined {
    return this.history.at(-1)?.output
  }

  private summarize(output: string): string {
    // Resumo simples: primeiros 500 chars. No futuro pode usar IA.
    if (output.length <= 500) return output
    return output.slice(0, 500) + '...'
  }
}

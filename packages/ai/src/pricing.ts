// Preços por 1M tokens (USD)
const PRICING: Record<string, { input: number; output: number }> = {
  // Anthropic
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-haiku-4-20250414': { input: 0.8, output: 4 },
  'claude-opus-4-20250514': { input: 15, output: 75 },

  // OpenAI
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'o1': { input: 15, output: 60 },
  'o1-mini': { input: 1.1, output: 4.4 },
  'o3-mini': { input: 1.1, output: 4.4 },
}

export function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = PRICING[model]

  if (!pricing) {
    // Fallback: estimativa conservadora baseada no provider
    const fallback =
      provider === 'anthropic'
        ? { input: 3, output: 15 }
        : { input: 2.5, output: 10 }

    return (inputTokens * fallback.input + outputTokens * fallback.output) / 1_000_000
  }

  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000
}

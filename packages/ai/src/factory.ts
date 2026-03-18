import type { AIProvider as AIProviderType } from '@crewflow/shared'
import type { AIProvider } from './types'
import { AnthropicProvider } from './providers/anthropic'
import { OpenAIProvider } from './providers/openai'

export function createProvider(provider: AIProviderType, apiKey: string): AIProvider {
  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider(apiKey)
    case 'openai':
      return new OpenAIProvider(apiKey)
    default:
      throw new Error(`Provedor de IA não suportado: ${provider}`)
  }
}

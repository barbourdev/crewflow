import type { AIProvider, AIMessage, AIResponse, GenerateOptions, StreamCallback } from '../types'

export class OpenAIProvider implements AIProvider {
  private apiKey: string
  private defaultModel: string

  constructor(apiKey: string, defaultModel = 'gpt-4o') {
    this.apiKey = apiKey
    this.defaultModel = defaultModel
  }

  // TODO: Implementar
  async generateText(_messages: AIMessage[], _options?: GenerateOptions): Promise<AIResponse> {
    void this.apiKey
    void this.defaultModel
    return { content: '', tokensUsed: { input: 0, output: 0, total: 0 }, cost: 0 }
  }

  async streamText(
    _messages: AIMessage[],
    _onChunk: StreamCallback,
    _options?: GenerateOptions,
  ): Promise<AIResponse> {
    return { content: '', tokensUsed: { input: 0, output: 0, total: 0 }, cost: 0 }
  }
}

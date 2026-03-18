export type StreamCallback = (chunk: string) => void

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  tokensUsed: {
    input: number
    output: number
    total: number
  }
  cost: number
}

export interface AIProvider {
  generateText(messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse>
  streamText(
    messages: AIMessage[],
    onChunk: StreamCallback,
    options?: GenerateOptions,
  ): Promise<AIResponse>
}

export interface GenerateOptions {
  model?: string
  maxTokens?: number
  temperature?: number
}

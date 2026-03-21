export type StreamCallback = (chunk: string) => void

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool_result'
  content: string
  /** Para role=tool_result: id da tool call que originou este resultado */
  toolCallId?: string
  /** Para role=assistant com tool calls: as chamadas feitas */
  toolCalls?: AIToolCall[]
}

export interface AIResponse {
  content: string
  tokensUsed: {
    input: number
    output: number
    total: number
  }
  cost: number
  /** Tool calls que o modelo quer executar (quando stop_reason=tool_use) */
  toolCalls?: AIToolCall[]
  /** Motivo de parada */
  stopReason?: 'end_turn' | 'tool_use' | 'max_tokens'
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
  /** Tools disponiveis para o modelo usar */
  tools?: AITool[]
}

// ============================================================================
// Tool Use Types
// ============================================================================

export interface AITool {
  name: string
  description: string
  input_schema: Record<string, unknown>
}

export interface AIToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

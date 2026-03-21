import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, AIMessage, AIResponse, GenerateOptions, StreamCallback, AIToolCall } from '../types'
import { calculateCost } from '../pricing'
import { withRetry } from '../retry'

export class AnthropicProvider implements AIProvider {
  private client: Anthropic
  private defaultModel: string

  constructor(apiKey: string, defaultModel = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey })
    this.defaultModel = defaultModel
  }

  async generateText(messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse> {
    const model = options?.model ?? this.defaultModel
    const { system, chatMessages } = this.splitMessages(messages)

    const params: Anthropic.MessageCreateParams = {
      model,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      ...(system ? { system } : {}),
      messages: chatMessages,
    }

    // Adicionar tools se fornecidas
    if (options?.tools && options.tools.length > 0) {
      params.tools = options.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema as Anthropic.Tool.InputSchema,
      }))
    }

    const response = await withRetry(() => this.client.messages.create(params))

    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    const toolCalls: AIToolCall[] = response.content
      .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
      .map((block) => ({
        id: block.id,
        name: block.name,
        input: block.input as Record<string, unknown>,
      }))

    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens

    return {
      content: textContent,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      cost: calculateCost('anthropic', model, inputTokens, outputTokens),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      stopReason: response.stop_reason === 'tool_use' ? 'tool_use'
        : response.stop_reason === 'max_tokens' ? 'max_tokens'
          : 'end_turn',
    }
  }

  async streamText(
    messages: AIMessage[],
    onChunk: StreamCallback,
    options?: GenerateOptions,
  ): Promise<AIResponse> {
    const model = options?.model ?? this.defaultModel
    const { system, chatMessages } = this.splitMessages(messages)

    // Se tem tools, usar generateText (tool_use nao faz streaming bem)
    if (options?.tools && options.tools.length > 0) {
      const result = await this.generateText(messages, options)
      if (result.content) onChunk(result.content)
      return result
    }

    return withRetry(async () => {
      const stream = this.client.messages.stream({
        model,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        ...(system ? { system } : {}),
        messages: chatMessages,
      })

      let fullContent = ''

      stream.on('text', (text) => {
        fullContent += text
        onChunk(text)
      })

      const finalMessage = await stream.finalMessage()

      const inputTokens = finalMessage.usage.input_tokens
      const outputTokens = finalMessage.usage.output_tokens

      return {
        content: fullContent,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        cost: calculateCost('anthropic', model, inputTokens, outputTokens),
        stopReason: 'end_turn' as const,
      }
    })
  }

  private splitMessages(messages: AIMessage[]): {
    system: string | undefined
    chatMessages: Anthropic.MessageParam[]
  } {
    let system: string | undefined
    const chatMessages: Anthropic.MessageParam[] = []

    for (const msg of messages) {
      if (msg.role === 'system') {
        system = msg.content
      } else if (msg.role === 'tool_result') {
        // Tool result — formato Anthropic
        chatMessages.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: msg.toolCallId!,
            content: msg.content,
          }],
        })
      } else if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        // Assistant message com tool calls
        const content: Anthropic.ContentBlockParam[] = []
        if (msg.content) {
          content.push({ type: 'text', text: msg.content })
        }
        for (const tc of msg.toolCalls) {
          content.push({
            type: 'tool_use',
            id: tc.id,
            name: tc.name,
            input: tc.input,
          })
        }
        chatMessages.push({ role: 'assistant', content })
      } else {
        chatMessages.push({ role: msg.role as 'user' | 'assistant', content: msg.content })
      }
    }

    return { system, chatMessages }
  }
}

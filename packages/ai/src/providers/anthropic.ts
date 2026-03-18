import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, AIMessage, AIResponse, GenerateOptions, StreamCallback } from '../types'
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

    const response = await withRetry(() =>
      this.client.messages.create({
        model,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        ...(system ? { system } : {}),
        messages: chatMessages,
      }),
    )

    const content = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens

    return {
      content,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      cost: calculateCost('anthropic', model, inputTokens, outputTokens),
    }
  }

  async streamText(
    messages: AIMessage[],
    onChunk: StreamCallback,
    options?: GenerateOptions,
  ): Promise<AIResponse> {
    const model = options?.model ?? this.defaultModel
    const { system, chatMessages } = this.splitMessages(messages)

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
      } else {
        chatMessages.push({ role: msg.role, content: msg.content })
      }
    }

    return { system, chatMessages }
  }
}

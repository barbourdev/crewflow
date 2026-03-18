import OpenAI from 'openai'
import type { AIProvider, AIMessage, AIResponse, GenerateOptions, StreamCallback } from '../types'
import { calculateCost } from '../pricing'
import { withRetry } from '../retry'

export class OpenAIProvider implements AIProvider {
  private client: OpenAI
  private defaultModel: string

  constructor(apiKey: string, defaultModel = 'gpt-4o') {
    this.client = new OpenAI({ apiKey })
    this.defaultModel = defaultModel
  }

  async generateText(messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse> {
    const model = options?.model ?? this.defaultModel

    const response = await withRetry(() =>
      this.client.chat.completions.create({
        model,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
      }),
    )

    const content = response.choices[0]?.message?.content ?? ''
    const inputTokens = response.usage?.prompt_tokens ?? 0
    const outputTokens = response.usage?.completion_tokens ?? 0

    return {
      content,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      cost: calculateCost('openai', model, inputTokens, outputTokens),
    }
  }

  async streamText(
    messages: AIMessage[],
    onChunk: StreamCallback,
    options?: GenerateOptions,
  ): Promise<AIResponse> {
    const model = options?.model ?? this.defaultModel

    return withRetry(async () => {
      const stream = await this.client.chat.completions.create({
        model,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
        stream: true,
        stream_options: { include_usage: true },
      })

      let fullContent = ''
      let inputTokens = 0
      let outputTokens = 0

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (delta) {
          fullContent += delta
          onChunk(delta)
        }
        if (chunk.usage) {
          inputTokens = chunk.usage.prompt_tokens
          outputTokens = chunk.usage.completion_tokens
        }
      }

      return {
        content: fullContent,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        cost: calculateCost('openai', model, inputTokens, outputTokens),
      }
    })
  }
}

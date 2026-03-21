import OpenAI from 'openai'
import type { AIProvider, AIMessage, AIResponse, GenerateOptions, StreamCallback, AIToolCall } from '../types'
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

    const params: OpenAI.ChatCompletionCreateParams = {
      model,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      messages: this.convertMessages(messages),
    }

    // Adicionar tools se fornecidas
    if (options?.tools && options.tools.length > 0) {
      params.tools = options.tools.map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.input_schema,
        },
      }))
    }

    const response = await withRetry(() => this.client.chat.completions.create(params))

    const content = response.choices[0]?.message?.content ?? ''
    const inputTokens = response.usage?.prompt_tokens ?? 0
    const outputTokens = response.usage?.completion_tokens ?? 0

    // Parse tool calls
    const rawToolCalls = response.choices[0]?.message?.tool_calls
    const toolCalls: AIToolCall[] = rawToolCalls
      ? rawToolCalls.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>,
      }))
      : []

    const finishReason = response.choices[0]?.finish_reason

    return {
      content,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      cost: calculateCost('openai', model, inputTokens, outputTokens),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      stopReason: finishReason === 'tool_calls' ? 'tool_use'
        : finishReason === 'length' ? 'max_tokens'
          : 'end_turn',
    }
  }

  async streamText(
    messages: AIMessage[],
    onChunk: StreamCallback,
    options?: GenerateOptions,
  ): Promise<AIResponse> {
    const model = options?.model ?? this.defaultModel

    // Se tem tools, usar generateText (tool_use com streaming eh complexo)
    if (options?.tools && options.tools.length > 0) {
      const result = await this.generateText(messages, options)
      if (result.content) onChunk(result.content)
      return result
    }

    return withRetry(async () => {
      const stream = await this.client.chat.completions.create({
        model,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        messages: this.convertMessages(messages),
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
        stopReason: 'end_turn' as const,
      }
    })
  }

  private convertMessages(messages: AIMessage[]): OpenAI.ChatCompletionMessageParam[] {
    const result: OpenAI.ChatCompletionMessageParam[] = []

    for (const msg of messages) {
      if (msg.role === 'tool_result') {
        // Tool result — formato OpenAI
        result.push({
          role: 'tool',
          tool_call_id: msg.toolCallId!,
          content: msg.content,
        })
      } else if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        // Assistant com tool calls
        result.push({
          role: 'assistant',
          content: msg.content || null,
          tool_calls: msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.input),
            },
          })),
        })
      } else {
        result.push({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })
      }
    }

    return result
  }
}

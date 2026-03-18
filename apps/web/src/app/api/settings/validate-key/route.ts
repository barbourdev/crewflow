import { NextRequest } from 'next/server'
import { success, handleError } from '@/lib/api-response'
import { validateApiKeySchema } from '@crewflow/shared'

async function validateAnthropicKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    })

    if (response.ok || response.status === 200) {
      return { valid: true }
    }

    if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' }
    }

    // 429 or other status still means the key is valid
    if (response.status === 429) {
      return { valid: true }
    }

    const data = (await response.json()) as { error?: { message?: string } }
    return {
      valid: false,
      error: data.error?.message ?? `Unexpected status: ${response.status}`,
    }
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Connection failed',
    }
  }
}

async function validateOpenAIKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      return { valid: true }
    }

    if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' }
    }

    if (response.status === 429) {
      return { valid: true }
    }

    const data = (await response.json()) as { error?: { message?: string } }
    return {
      valid: false,
      error: data.error?.message ?? `Unexpected status: ${response.status}`,
    }
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Connection failed',
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = validateApiKeySchema.parse(body)

    const result =
      data.provider === 'anthropic'
        ? await validateAnthropicKey(data.apiKey)
        : await validateOpenAIKey(data.apiKey)

    return success(result)
  } catch (err) {
    return handleError(err)
  }
}

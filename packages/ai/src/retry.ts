export interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  baseDelayMs: 5000,
  maxDelayMs: 60000,
}

function isRateLimitError(err: unknown): boolean {
  if (err && typeof err === 'object') {
    // Anthropic SDK: err.status === 429
    if ('status' in err && (err as { status: number }).status === 429) return true
    // OpenAI SDK: err.status === 429
    if ('code' in err && (err as { code: string }).code === 'rate_limit_exceeded') return true
    // Generic message check
    if ('message' in err && typeof (err as { message: string }).message === 'string') {
      const msg = (err as { message: string }).message.toLowerCase()
      if (msg.includes('rate_limit') || msg.includes('rate limit') || msg.includes('429')) return true
    }
  }
  return false
}

function getRetryAfterMs(err: unknown): number | null {
  if (err && typeof err === 'object' && 'headers' in err) {
    const headers = (err as { headers: Record<string, string> }).headers
    const retryAfter = headers?.['retry-after']
    if (retryAfter) {
      const seconds = parseFloat(retryAfter)
      if (!isNaN(seconds)) return seconds * 1000
    }
  }
  return null
}

export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (!isRateLimitError(err) || attempt === opts.maxRetries) {
        throw err
      }

      const retryAfter = getRetryAfterMs(err)
      const exponentialDelay = Math.min(opts.baseDelayMs * Math.pow(2, attempt), opts.maxDelayMs)
      const delay = retryAfter ?? exponentialDelay

      console.log(`[AI] Rate limit hit, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${opts.maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error('Unreachable')
}

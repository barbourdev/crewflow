import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, handleError } from '@/lib/api-response'
import { updateSettingsSchema } from '@crewflow/shared'

function maskApiKey(key: string): string {
  if (key.length <= 8) return '****'
  return `${key.slice(0, 3)}...${key.slice(-3)}`
}

export async function GET() {
  try {
    const user = await prisma.user.findFirstOrThrow()

    let apiKeys: Record<string, string> = {}
    if (user.apiKeys) {
      try {
        const parsed = JSON.parse(user.apiKeys) as Record<string, string>
        apiKeys = Object.fromEntries(
          Object.entries(parsed).map(([provider, key]) => [
            provider,
            key ? maskApiKey(key) : '',
          ])
        )
      } catch {
        // ignore parse errors
      }
    }

    let preferences: Record<string, unknown> = {}
    try {
      preferences = JSON.parse(user.preferences) as Record<string, unknown>
    } catch {
      // ignore parse errors
    }

    return success({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      language: user.language,
      currency: user.currency,
      preferences,
      apiKeys,
    })
  } catch (err) {
    return handleError(err)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await prisma.user.findFirstOrThrow()
    const body = await request.json()
    const data = updateSettingsSchema.parse(body)

    const updateData: Record<string, unknown> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.language !== undefined) updateData.language = data.language
    if (data.currency !== undefined) updateData.currency = data.currency

    // Persist betaFeatures/verboseLogging in preferences JSON
    if (data.betaFeatures !== undefined || data.verboseLogging !== undefined) {
      let prefs: Record<string, unknown> = {}
      try { prefs = JSON.parse(user.preferences) as Record<string, unknown> } catch { /* */ }
      if (data.betaFeatures !== undefined) prefs.betaFeatures = data.betaFeatures
      if (data.verboseLogging !== undefined) prefs.verboseLogging = data.verboseLogging
      updateData.preferences = JSON.stringify(prefs)
    }

    if (data.anthropicApiKey !== undefined || data.openaiApiKey !== undefined) {
      let existingKeys: Record<string, string> = {}
      if (user.apiKeys) {
        try {
          existingKeys = JSON.parse(user.apiKeys) as Record<string, string>
        } catch {
          // ignore
        }
      }

      if (data.anthropicApiKey !== undefined) {
        existingKeys.anthropic = data.anthropicApiKey
      }
      if (data.openaiApiKey !== undefined) {
        existingKeys.openai = data.openaiApiKey
      }

      updateData.apiKeys = JSON.stringify(existingKeys)
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    let apiKeys: Record<string, string> = {}
    if (updated.apiKeys) {
      try {
        const parsed = JSON.parse(updated.apiKeys) as Record<string, string>
        apiKeys = Object.fromEntries(
          Object.entries(parsed).map(([provider, key]) => [
            provider,
            key ? maskApiKey(key) : '',
          ])
        )
      } catch {
        // ignore
      }
    }

    return success({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      language: updated.language,
      currency: updated.currency,
      apiKeys,
    })
  } catch (err) {
    return handleError(err)
  }
}

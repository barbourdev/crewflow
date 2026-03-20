import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, handleError } from '@/lib/api-response'
import { wsServer } from '@/lib/ws-server'
import { startArchitect, getArchitectSession, cancelArchitectSession, getPendingQuestion } from '@/lib/architect'

/**
 * POST /api/squads/architect
 * Inicia uma sessao do Architect para criar um squad guiado por IA.
 *
 * Body:
 *   mode?: 'create' | 'evaluate-agent' (default: 'create')
 *   squadId?: string (para mode='evaluate-agent')
 *   agentTemplateId?: string (para mode='evaluate-agent')
 */
export async function POST(request: NextRequest) {
  try {
    const user = await prisma.user.findFirstOrThrow()
    const body = await request.json().catch(() => ({})) as {
      mode?: 'create' | 'evaluate-agent'
      squadId?: string
      agentTemplateId?: string
      squadName?: string
      squadIcon?: string
    }

    const mode = body.mode ?? 'create'

    // Check if there's already an active session for this user — reuse it
    const existing = getArchitectSession(`active-${user.id}`)
    if (existing && existing.status === 'running') {
      console.log(`[ARCHITECT] Reusing existing session: ${existing.id}`)
      return success({ sessionId: existing.id, mode: existing.mode })
    }

    const sessionId = `architect-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

    // Start architect in background (non-blocking)
    startArchitect(
      sessionId,
      user.id,
      mode,
      mode === 'evaluate-agent' && body.squadId
        ? { squadId: body.squadId, agentTemplateId: body.agentTemplateId ?? '' }
        : undefined,
      body.squadName,
      body.squadIcon,
    ).catch((err) => {
      console.error('[ARCHITECT] Background error:', err)
    })

    return success({ sessionId, mode })
  } catch (err) {
    return handleError(err)
  }
}

/**
 * GET /api/squads/architect?sessionId=xxx
 * Retorna o status da sessao do Architect.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId')
    if (!sessionId) {
      return success({ error: 'sessionId required' }, 400)
    }

    const session = getArchitectSession(sessionId)
    if (!session) {
      return success({ error: 'Session not found or expired' }, 404)
    }

    const pendingQuestion = getPendingQuestion(sessionId)

    return success({
      id: session.id,
      mode: session.mode,
      status: session.status,
      phase: session.phase,
      discovery: session.discovery,
      design: session.design.agents
        ? {
            agentCount: session.design.agents.length,
            stepCount: session.design.pipeline?.length ?? 0,
            dataCount: session.design.squadData?.length ?? 0,
          }
        : null,
      pendingQuestion: pendingQuestion ?? null,
    })
  } catch (err) {
    return handleError(err)
  }
}

/**
 * PATCH /api/squads/architect
 * Responde a um checkpoint do Architect (resolve a promise pendente no WS server).
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as {
      sessionId: string
      runStepId: string
      action: 'approve' | 'adjust' | 'redo'
      feedback?: string
      selected?: string
    }

    wsServer.resolveCheckpoint(body.runStepId, {
      runId: body.sessionId,
      runStepId: body.runStepId,
      action: body.action,
      feedback: body.feedback,
      selected: body.selected,
    })

    return success({ ok: true })
  } catch (err) {
    return handleError(err)
  }
}

/**
 * DELETE /api/squads/architect?sessionId=xxx
 * Cancela uma sessao ativa do Architect.
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId')
    if (!sessionId) {
      return success({ error: 'sessionId required' }, 400)
    }

    cancelArchitectSession(sessionId)
    return success({ ok: true })
  } catch (err) {
    return handleError(err)
  }
}

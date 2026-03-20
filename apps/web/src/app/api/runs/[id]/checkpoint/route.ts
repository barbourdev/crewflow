import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, notFound, handleError } from '@/lib/api-response'
import { wsServer } from '@/lib/ws-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json() as {
      runStepId: string
      action: 'approve' | 'adjust' | 'redo'
      feedback?: string
      selected?: string
    }

    const run = await prisma.run.findUnique({ where: { id } })
    if (!run) return notFound('Run')

    // Resolver o checkpoint pendente no WS server (desbloqueia o pipeline runner)
    wsServer.resolveCheckpoint(body.runStepId, {
      runId: id,
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

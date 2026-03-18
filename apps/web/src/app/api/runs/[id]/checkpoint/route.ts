import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, notFound, badRequest, handleError } from '@/lib/api-response'
import { checkpointResponseSchema } from '@crewflow/shared'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = checkpointResponseSchema.parse(body)

    const run = await prisma.run.findUnique({ where: { id } })
    if (!run) return notFound('Run')

    if (run.status !== 'paused') {
      return badRequest('Run is not paused at a checkpoint')
    }

    const runStep = await prisma.runStep.findFirst({
      where: { runId: id, stepId: data.stepId },
    })

    if (!runStep) return notFound('RunStep')

    await prisma.runStep.update({
      where: { id: runStep.id },
      data: {
        output: JSON.stringify({
          checkpointAction: data.action,
          checkpointFeedback: data.feedback,
        }),
      },
    })

    const updatedRun = await prisma.run.update({
      where: { id },
      data: { status: 'running' },
      include: {
        steps: {
          orderBy: { createdAt: 'asc' },
          include: { step: true },
        },
      },
    })

    return success(updatedRun)
  } catch (err) {
    return handleError(err)
  }
}

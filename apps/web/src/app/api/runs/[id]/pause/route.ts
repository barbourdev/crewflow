import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, notFound, badRequest, handleError } from '@/lib/api-response'
import { getActiveRunner } from '@/lib/run-executor'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const run = await prisma.run.findUnique({ where: { id } })
    if (!run) return notFound('Run')

    if (run.status !== 'running') {
      return badRequest('Only running runs can be paused')
    }

    // Pausar o runner ativo
    const runner = getActiveRunner(id)
    if (runner) runner.pause()

    const updated = await prisma.run.update({
      where: { id },
      data: { status: 'paused' },
    })

    return success(updated)
  } catch (err) {
    return handleError(err)
  }
}

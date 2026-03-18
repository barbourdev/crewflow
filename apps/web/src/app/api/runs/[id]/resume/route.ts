import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, notFound, badRequest, handleError } from '@/lib/api-response'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const run = await prisma.run.findUnique({ where: { id } })
    if (!run) return notFound('Run')

    if (run.status !== 'paused') {
      return badRequest('Only paused runs can be resumed')
    }

    const updated = await prisma.run.update({
      where: { id },
      data: { status: 'running' },
    })

    return success(updated)
  } catch (err) {
    return handleError(err)
  }
}

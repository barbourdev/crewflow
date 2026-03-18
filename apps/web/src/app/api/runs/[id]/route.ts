import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, notFound, handleError } from '@/lib/api-response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const run = await prisma.run.findUnique({
      where: { id },
      include: {
        squad: { select: { id: true, name: true, code: true, icon: true } },
        steps: {
          orderBy: { createdAt: 'asc' },
          include: {
            step: true,
            agent: { select: { id: true, name: true, icon: true } },
            logs: { orderBy: { timestamp: 'asc' } },
          },
        },
      },
    })

    if (!run) return notFound('Run')

    return success(run)
  } catch (err) {
    return handleError(err)
  }
}

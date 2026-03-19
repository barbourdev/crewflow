import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, notFound, badRequest, handleError } from '@/lib/api-response'
import { getActiveRunner } from '@/lib/run-executor'
import { wsServer } from '@/lib/ws-server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const run = await prisma.run.findUnique({ where: { id } })
    if (!run) return notFound('Run')

    if (run.status === 'completed' || run.status === 'cancelled') {
      return badRequest('Run is already finished or cancelled')
    }

    // Cancelar o runner ativo e liberar waiters pendentes
    const runner = getActiveRunner(id)
    if (runner) runner.cancel()
    wsServer.cancelPendingWaiters(id)

    // Agregar custo parcial dos steps já completados
    const costAgg = await prisma.runStep.aggregate({
      where: { runId: id, status: 'completed' },
      _sum: { cost: true, tokensUsed: true },
    })

    const partialCost = costAgg._sum.cost ?? 0
    const partialTokens = costAgg._sum.tokensUsed ?? 0

    const updated = await prisma.$transaction(async (tx) => {
      await tx.runStep.updateMany({
        where: { runId: id, status: { in: ['pending', 'running'] } },
        data: { status: 'skipped' },
      })

      return tx.run.update({
        where: { id },
        data: {
          status: 'cancelled',
          totalCost: partialCost,
          totalTokens: partialTokens,
          completedAt: new Date(),
        },
      })
    })

    return success(updated)
  } catch (err) {
    return handleError(err)
  }
}

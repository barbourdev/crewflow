import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { paginated, created, notFound, handleError, parsePagination } from '@/lib/api-response'
import { executeRun } from '@/lib/run-executor'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePagination(searchParams)
    const status = searchParams.get('status')

    const squad = await prisma.squad.findUnique({ where: { id } })
    if (!squad) return notFound('Squad')

    const where: Record<string, unknown> = { squadId: id }
    if (status) where.status = status

    const [runs, total] = await Promise.all([
      prisma.run.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          _count: { select: { steps: true } },
        },
      }),
      prisma.run.count({ where }),
    ])

    return paginated(runs, total, page, limit)
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await prisma.user.findFirstOrThrow()
    const body = await request.json()

    const squad = await prisma.squad.findUnique({
      where: { id },
      include: {
        pipeline: {
          include: {
            steps: { orderBy: { order: 'asc' } },
          },
        },
      },
    })

    if (!squad) return notFound('Squad')
    if (!squad.pipeline) return notFound('Pipeline')

    const run = await prisma.$transaction(async (tx: any) => {
      const newRun = await tx.run.create({
        data: {
          squadId: id,
          userId: user.id,
          status: 'queued',
          input: body.input ? JSON.stringify(body.input) : '{}',
        },
      })

      for (const step of squad.pipeline!.steps) {
        await tx.runStep.create({
          data: {
            runId: newRun.id,
            stepId: step.id,
            agentId: step.agentId,
            status: 'pending',
          },
        })
      }

      return tx.run.findUnique({
        where: { id: newRun.id },
        include: {
          steps: {
            orderBy: { createdAt: 'asc' },
            include: {
              step: true,
            },
          },
        },
      })
    })

    // Disparar execução em background (não bloqueia a response)
    if (run) {
      executeRun(run.id).catch((err) => {
        console.error(`[Run ${run!.id}] Erro na execução:`, err)
      })
    }

    return created(run)
  } catch (err) {
    return handleError(err)
  }
}

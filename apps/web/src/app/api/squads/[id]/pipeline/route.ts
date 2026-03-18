import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, notFound, handleError } from '@/lib/api-response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pipeline = await prisma.pipeline.findUnique({
      where: { squadId: id },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            agent: { select: { id: true, name: true, icon: true } },
          },
        },
      },
    })

    if (!pipeline) return notFound('Pipeline')

    return success(pipeline)
  } catch (err) {
    return handleError(err)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { steps, config } = body

    const pipeline = await prisma.pipeline.findUnique({
      where: { squadId: id },
    })

    if (!pipeline) return notFound('Pipeline')

    const updated = await prisma.$transaction(async (tx) => {
      await tx.step.deleteMany({ where: { pipelineId: pipeline.id } })

      if (config) {
        await tx.pipeline.update({
          where: { id: pipeline.id },
          data: { config: JSON.stringify(config) },
        })
      }

      if (steps && Array.isArray(steps)) {
        for (const step of steps) {
          await tx.step.create({
            data: {
              pipelineId: pipeline.id,
              agentId: step.agentId,
              order: step.order,
              label: step.label,
              type: step.type ?? 'inline',
              inputConfig: step.inputConfig
                ? JSON.stringify(step.inputConfig)
                : '{}',
              outputConfig: step.outputConfig
                ? JSON.stringify(step.outputConfig)
                : '{}',
              vetoConditions: step.vetoConditions
                ? JSON.stringify(step.vetoConditions)
                : '[]',
              format: step.format ?? 'markdown',
              onReject: step.onReject ?? 'retry',
              maxRetries: step.maxRetries ?? 3,
              parallelGroup: step.parallelGroup,
            },
          })
        }
      }

      return tx.pipeline.findUnique({
        where: { id: pipeline.id },
        include: {
          steps: {
            orderBy: { order: 'asc' },
            include: {
              agent: { select: { id: true, name: true, icon: true } },
            },
          },
        },
      })
    })

    return success(updated)
  } catch (err) {
    return handleError(err)
  }
}

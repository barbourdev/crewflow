import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, noContent, notFound, handleError } from '@/lib/api-response'
import { updateSquadSchema } from '@crewflow/shared'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const squad = await prisma.squad.findUnique({
      where: { id },
      include: {
        agents: {
          include: {
            skills: { include: { skill: true } },
          },
        },
        pipeline: {
          include: {
            steps: { orderBy: { order: 'asc' } },
          },
        },
        runs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            _count: { select: { steps: true } },
            steps: {
              orderBy: { step: { order: 'asc' } },
              select: {
                id: true,
                status: true,
                step: { select: { id: true, order: true, label: true, type: true } },
              },
            },
          },
        },
      },
    })

    if (!squad) return notFound('Squad')

    return success(squad)
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
    const data = updateSquadSchema.parse(body)

    const existing = await prisma.squad.findUnique({ where: { id } })
    if (!existing) return notFound('Squad')

    const squad = await prisma.squad.update({
      where: { id },
      data,
    })

    return success(squad)
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.squad.findUnique({ where: { id } })
    if (!existing) return notFound('Squad')

    await prisma.squad.update({
      where: { id },
      data: { isArchived: true },
    })

    return noContent()
  } catch (err) {
    return handleError(err)
  }
}

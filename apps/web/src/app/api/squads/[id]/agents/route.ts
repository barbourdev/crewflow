import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, created, notFound, handleError } from '@/lib/api-response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const squad = await prisma.squad.findUnique({ where: { id } })
    if (!squad) return notFound('Squad')

    const agents = await prisma.agent.findMany({
      where: { squadId: id },
      include: {
        skills: { include: { skill: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return success(agents)
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

    const squad = await prisma.squad.findUnique({ where: { id } })
    if (!squad) return notFound('Squad')

    const body = await request.json()

    const agent = await prisma.agent.create({
      data: {
        squadId: id,
        name: body.name,
        role: body.role,
        icon: body.icon,
        persona: body.persona ? JSON.stringify(body.persona) : '{}',
        model: body.model,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        positionCol: body.positionCol ?? 0,
        positionRow: body.positionRow ?? 0,
      },
      include: {
        skills: { include: { skill: true } },
      },
    })

    return created(agent)
  } catch (err) {
    return handleError(err)
  }
}

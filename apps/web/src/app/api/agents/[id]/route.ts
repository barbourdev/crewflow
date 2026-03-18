import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, noContent, notFound, handleError } from '@/lib/api-response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        squad: { select: { id: true, name: true, code: true } },
      },
    })

    if (!agent) return notFound('Agent')

    return success(agent)
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

    const existing = await prisma.agent.findUnique({ where: { id } })
    if (!existing) return notFound('Agent')

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        name: body.name,
        role: body.role,
        icon: body.icon,
        persona: body.persona ? JSON.stringify(body.persona) : undefined,
        model: body.model,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        positionCol: body.positionCol,
        positionRow: body.positionRow,
      },
      include: {
        skills: { include: { skill: true } },
      },
    })

    return success(agent)
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

    const existing = await prisma.agent.findUnique({ where: { id } })
    if (!existing) return notFound('Agent')

    await prisma.agent.delete({ where: { id } })

    return noContent()
  } catch (err) {
    return handleError(err)
  }
}

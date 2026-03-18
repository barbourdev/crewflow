import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, notFound, handleError } from '@/lib/api-response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        agents: {
          include: {
            agent: {
              select: { id: true, name: true, icon: true },
            },
          },
        },
      },
    })

    if (!skill) return notFound('Skill')

    return success(skill)
  } catch (err) {
    return handleError(err)
  }
}

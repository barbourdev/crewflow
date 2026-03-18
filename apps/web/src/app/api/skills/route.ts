import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, handleError } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (type) where.type = type

    const skills = await prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return success(skills)
  } catch (err) {
    return handleError(err)
  }
}

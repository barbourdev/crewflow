import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { paginated, created, handleError, parsePagination, parseSort } from '@/lib/api-response'
import { createSquadSchema } from '@crewflow/shared'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const user = await prisma.user.findFirstOrThrow()
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePagination(searchParams)
    const orderBy = parseSort(searchParams, ['name', 'createdAt', 'updatedAt'])
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { userId: user.id, isArchived: false }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [squads, total] = await Promise.all([
      prisma.squad.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: { select: { agents: true } },
          runs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, status: true, createdAt: true },
          },
        },
      }),
      prisma.squad.count({ where }),
    ])

    const result = squads.map((squad) => ({
      ...squad,
      agentCount: squad._count.agents,
      lastRun: squad.runs[0] ?? null,
      _count: undefined,
      runs: undefined,
    }))

    return paginated(result, total, page, limit)
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await prisma.user.findFirstOrThrow()
    const body = await request.json()
    const data = createSquadSchema.parse(body)

    const baseCode = slugify(data.name)
    let code = baseCode
    let counter = 1

    while (await prisma.squad.findUnique({ where: { code } })) {
      code = `${baseCode}-${counter}`
      counter++
    }

    const squad = await prisma.squad.create({
      data: {
        name: data.name,
        code,
        description: data.description,
        icon: data.icon,
        userId: user.id,
        pipeline: {
          create: {},
        },
      },
      include: {
        pipeline: true,
      },
    })

    return created(squad)
  } catch (err) {
    return handleError(err)
  }
}

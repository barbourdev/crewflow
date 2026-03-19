import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { paginated, created, handleError, parsePagination, parseSort } from '@/lib/api-response'
import { createSquadSchema } from '@crewflow/shared'

// Gradientes CSS salvos como valor inline-safe (cor hex com opacidade)
const GRADIENTS = [
  'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(168,85,247,0.1) 100%)',
  'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.1) 100%)',
  'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.1) 100%)',
  'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(20,184,166,0.1) 100%)',
  'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(244,63,94,0.1) 100%)',
  'linear-gradient(135deg, rgba(14,165,233,0.2) 0%, rgba(99,102,241,0.1) 100%)',
  'linear-gradient(135deg, rgba(217,70,239,0.2) 0%, rgba(139,92,246,0.1) 100%)',
  'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(59,130,246,0.1) 100%)',
  'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(249,115,22,0.1) 100%)',
  'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(16,185,129,0.1) 100%)',
  'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(234,179,8,0.1) 100%)',
  'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(217,70,239,0.1) 100%)',
]

function randomGradient(): string {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]!
}

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
        { name: { contains: search } },
        { description: { contains: search } },
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
        gradient: randomGradient(),
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

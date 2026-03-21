import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, handleError } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const user = await prisma.user.findFirstOrThrow()
    const { searchParams } = new URL(request.url)

    // Params
    const days = parseInt(searchParams.get('days') ?? '30', 10)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)))
    const skip = (page - 1) * limit
    const search = searchParams.get('search') ?? ''
    const sortBy = searchParams.get('sortBy') as 'duration' | 'tokens' | 'cost' | null
    const sortDir = (searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc'

    // Date ranges
    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Run search filter
    const runWhere: Record<string, unknown> = {
      userId: user.id,
      createdAt: { gte: since },
    }
    if (search) {
      runWhere.squad = { name: { contains: search } }
    }

    // Sort mapping
    let orderBy: Record<string, string> = { createdAt: 'desc' }
    if (sortBy === 'tokens') orderBy = { totalTokens: sortDir }
    else if (sortBy === 'cost') orderBy = { totalCost: sortDir }
    // duration: nao da pra sortear por campo calculado no Prisma, fallback pra createdAt

    const [
      costToday,
      costYesterday,
      totalTokens,
      totalCost,
      runs,
      totalRuns,
      costBySquad,
    ] = await Promise.all([
      prisma.run.aggregate({
        where: { userId: user.id, createdAt: { gte: today } },
        _sum: { totalCost: true, totalTokens: true },
      }),

      prisma.run.aggregate({
        where: { userId: user.id, createdAt: { gte: yesterday, lt: today } },
        _sum: { totalCost: true },
      }),

      prisma.run.aggregate({
        where: { userId: user.id, createdAt: { gte: since } },
        _sum: { totalTokens: true },
      }),

      prisma.run.aggregate({
        where: { userId: user.id, createdAt: { gte: since } },
        _sum: { totalCost: true },
      }),

      // Paginated runs
      prisma.run.findMany({
        where: runWhere,
        orderBy,
        skip,
        take: limit,
        include: {
          squad: { select: { id: true, name: true, icon: true } },
        },
      }),

      // Total count for pagination
      prisma.run.count({ where: runWhere }),

      prisma.run.groupBy({
        by: ['squadId'],
        where: { userId: user.id, createdAt: { gte: since } },
        _sum: { totalCost: true, totalTokens: true },
        _count: true,
      }),
    ])

    // Enrich cost by squad
    const squadIds = costBySquad.map((s: any) => s.squadId)
    const squads = await prisma.squad.findMany({
      where: { id: { in: squadIds } },
      select: { id: true, name: true, icon: true },
    })
    const squadMap = new Map(squads.map((s: any) => [s.id, s]))

    const costTodayVal = costToday._sum.totalCost ?? 0
    const costYesterdayVal = costYesterday._sum.totalCost ?? 0
    const costChange = costYesterdayVal > 0
      ? ((costTodayVal - costYesterdayVal) / costYesterdayVal) * 100
      : 0

    return success({
      costToday: costTodayVal,
      costYesterday: costYesterdayVal,
      costChangePercent: Math.round(costChange * 10) / 10,
      monthlyCostEstimate: costTodayVal * 30,
      totalTokens: totalTokens._sum.totalTokens ?? 0,
      totalCost: totalCost._sum.totalCost ?? 0,
      tokensToday: costToday._sum.totalTokens ?? 0,
      costBySquad: costBySquad
        .map((s: any) => ({
          squadId: s.squadId,
          name: squadMap.get(s.squadId)?.name ?? 'Unknown',
          icon: squadMap.get(s.squadId)?.icon ?? null,
          totalCost: s._sum.totalCost ?? 0,
          totalTokens: s._sum.totalTokens ?? 0,
          runCount: s._count,
        }))
        .sort((a: any, b: any) => b.totalCost - a.totalCost),
      runs: runs.map((r: any) => ({
        id: r.id,
        status: r.status,
        totalTokens: r.totalTokens,
        totalCost: r.totalCost,
        startedAt: r.startedAt,
        completedAt: r.completedAt,
        createdAt: r.createdAt,
        squad: r.squad,
      })),
      totalRuns,
      page,
      limit,
    })
  } catch (err) {
    return handleError(err)
  }
}

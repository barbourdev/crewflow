import { prisma } from '@/lib/db'
import { success, handleError } from '@/lib/api-response'

export async function GET() {
  try {
    const user = await prisma.user.findFirstOrThrow()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalSquads, runsToday, costToday, recentRuns, activeRuns, healthStats] = await Promise.all([
      prisma.squad.count({
        where: { userId: user.id, isArchived: false },
      }),

      prisma.run.count({
        where: {
          userId: user.id,
          createdAt: { gte: today },
        },
      }),

      prisma.run.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: today },
        },
        _sum: { totalCost: true },
      }),

      prisma.run.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          squad: { select: { id: true, name: true, icon: true } },
        },
      }),

      prisma.run.count({
        where: {
          userId: user.id,
          status: 'running',
        },
      }),

      // System Health: taxa de sucesso dos ultimos 100 runs
      prisma.run.groupBy({
        by: ['status'],
        where: { userId: user.id },
        _count: true,
        orderBy: { _count: { status: 'desc' } },
      }),
    ])

    // Calcular System Health
    const totalRuns = healthStats.reduce((sum: number, s: any) => sum + s._count, 0)
    const completedRuns = healthStats.find((s: any) => s.status === 'completed')?._count ?? 0
    const systemHealth = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 1000) / 10 : 100

    return success({
      totalSquads,
      runsToday,
      costToday: costToday._sum.totalCost ?? 0,
      activeRuns,
      systemHealth,
      recentRuns,
    })
  } catch (err) {
    return handleError(err)
  }
}

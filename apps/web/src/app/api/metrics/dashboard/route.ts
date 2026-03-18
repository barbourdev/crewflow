import { prisma } from '@/lib/db'
import { success, handleError } from '@/lib/api-response'

export async function GET() {
  try {
    const user = await prisma.user.findFirstOrThrow()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalSquads, runsToday, costToday, recentRuns] = await Promise.all([
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
    ])

    return success({
      totalSquads,
      runsToday,
      costToday: costToday._sum.totalCost ?? 0,
      recentRuns,
    })
  } catch (err) {
    return handleError(err)
  }
}

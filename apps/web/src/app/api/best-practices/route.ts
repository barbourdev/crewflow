import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { paginated, handleError, parsePagination } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePagination(searchParams)
    const category = searchParams.get('category')
    const platform = searchParams.get('platform')

    const where: Record<string, string> = {}
    if (category) where.category = category
    if (platform) where.platform = platform

    const [bestPractices, total] = await Promise.all([
      prisma.bestPractice.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.bestPractice.count({ where }),
    ])

    return paginated(bestPractices, total, page, limit)
  } catch (err) {
    return handleError(err)
  }
}

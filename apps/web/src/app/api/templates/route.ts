import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { paginated, handleError, parsePagination } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePagination(searchParams)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (category) where.category = category

    const [templates, total] = await Promise.all([
      prisma.squadTemplate.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.squadTemplate.count({ where }),
    ])

    return paginated(templates, total, page, limit)
  } catch (err) {
    return handleError(err)
  }
}

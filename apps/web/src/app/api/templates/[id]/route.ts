import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { success, notFound, handleError } from '@/lib/api-response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const template = await prisma.squadTemplate.findUnique({
      where: { id },
    })

    if (!template) return notFound('Template')

    return success(template)
  } catch (err) {
    return handleError(err)
  }
}

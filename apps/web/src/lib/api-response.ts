import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// ============================================================================
// Response Envelope
// ============================================================================

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SuccessResponse<T> {
  data: T
  meta?: PaginationMeta
}

export interface ErrorBody {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// ============================================================================
// Success Helpers
// ============================================================================

export function success<T>(data: T, status = 200) {
  const body: SuccessResponse<T> = { data }
  return NextResponse.json(body, { status })
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  status = 200,
) {
  const body: SuccessResponse<T[]> = {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
  return NextResponse.json(body, { status })
}

export function created<T>(data: T) {
  return success(data, 201)
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

// ============================================================================
// Error Helpers
// ============================================================================

export function error(code: string, message: string, status = 400, details?: unknown) {
  const body: ErrorBody = { error: { code, message, details } }
  return NextResponse.json(body, { status })
}

export function badRequest(message: string, details?: unknown) {
  return error('BAD_REQUEST', message, 400, details)
}

export function notFound(resource = 'Resource') {
  return error('NOT_FOUND', `${resource} not found`, 404)
}

export function conflict(message: string) {
  return error('CONFLICT', message, 409)
}

export function unprocessable(message: string, details?: unknown) {
  return error('VALIDATION_ERROR', message, 422, details)
}

export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return unprocessable('Validation failed', err.errors)
  }
  console.error(err)
  return error('INTERNAL_ERROR', 'Internal server error', 500)
}

// ============================================================================
// Pagination Parser
// ============================================================================

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function parseSort(searchParams: URLSearchParams, allowedFields: string[]) {
  const sort = searchParams.get('sort') ?? 'createdAt'
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
  const field = allowedFields.includes(sort) ? sort : 'createdAt'
  return { [field]: order } as Record<string, 'asc' | 'desc'>
}

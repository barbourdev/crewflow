'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Users,
  Bot,
  GitBranch,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Pause,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AppHeader } from '@/components/layout/app-header'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LastRun {
  id: string
  status: string
  createdAt: string
}

interface Squad {
  id: string
  name: string
  description: string | null
  icon: string
  code: string
  version: number
  agentCount: number
  lastRun: LastRun | null
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
  completed: { icon: CheckCircle2, className: 'text-emerald-500', label: 'Completed' },
  running: { icon: Loader2, className: 'text-amber animate-spin', label: 'Running' },
  failed: { icon: XCircle, className: 'text-destructive', label: 'Failed' },
  paused: { icon: Pause, className: 'text-amber', label: 'Paused' },
  pending: { icon: Clock, className: 'text-muted-foreground', label: 'Pending' },
  cancelled: { icon: XCircle, className: 'text-muted-foreground', label: 'Cancelled' },
}

function RunStatusBadge({ status }: { status: string }) {
  const config = (STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending)!
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SquadCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchSquads() {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({ limit: '50' })
        if (search.trim()) params.set('search', search.trim())
        const res = await fetch(`/api/squads?${params}`)
        if (!res.ok) throw new Error('Failed to load squads')
        const json = (await res.json()) as { data: Squad[]; meta: { total: number } }
        setSquads(json.data)
        setTotal(json.meta.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    const debounce = setTimeout(fetchSquads, search ? 300 : 0)
    return () => clearTimeout(debounce)
  }, [search])

  return (
    <>
      <AppHeader
        title="Squads"
        actions={
          <Button
            size="sm"
            className="bg-amber text-black hover:bg-amber/90"
            render={<Link href="/squads/new" />}
          >
            <Plus className="h-3.5 w-3.5" />
            New Squad
          </Button>
        }
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search squads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SquadCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {squads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <Users className="h-12 w-12 opacity-30" />
                <p className="text-sm font-medium">No squads yet</p>
                <p className="text-xs">Create your first squad to get started.</p>
                <Button
                  size="sm"
                  className="mt-2 bg-amber text-black hover:bg-amber/90"
                  render={<Link href="/squads/new" />}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Squad
                </Button>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {total} squad{total !== 1 ? 's' : ''} total
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {squads.map((squad) => (
                    <Link key={squad.id} href={`/squads/${squad.id}`} className="group">
                      <Card className="transition-colors group-hover:ring-amber/30">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber/10 text-lg">
                              {squad.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="truncate text-sm">
                                {squad.name}
                              </CardTitle>
                              {squad.description && (
                                <CardDescription className="line-clamp-1 text-xs">
                                  {squad.description}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              {squad.agentCount} agent{squad.agentCount !== 1 ? 's' : ''}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />
                              v{squad.version}
                            </span>
                            {squad.lastRun && (
                              <RunStatusBadge status={squad.lastRun.status} />
                            )}
                            <span className="ml-auto text-[10px]">
                              {timeAgo(squad.updatedAt)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

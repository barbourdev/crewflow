'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Zap,
  DollarSign,
  Activity,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardMetrics {
  totalSquads: number
  runsToday: number
  costToday: number
  recentRuns: RecentRun[]
}

interface RecentRun {
  id: string
  status: string
  duration: number | null
  totalCost: number | null
  createdAt: string
  squad: { id: string; name: string; icon: string | null }
}

interface Squad {
  id: string
  name: string
  description: string | null
  icon: string | null
  agentCount: number
  lastRun: { id: string; status: string; createdAt: string } | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  failed: 'bg-red-500/15 text-red-400 border-red-500/25',
  queued: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
}

function statusBadge(status: string) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.queued
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${colors}`}
    >
      {status}
    </span>
  )
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '--'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}

function formatCost(value: number | null): string {
  if (value == null) return '$0.00'
  return `$${value.toFixed(4)}`
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function truncate(text: string | null, max: number): string {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '...' : text
}

// ---------------------------------------------------------------------------
// Metric Card
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string
  value: string
  icon: React.ReactNode
  loading: boolean
}

function MetricCard({ label, value, icon, loading }: MetricCardProps) {
  return (
    <Card className="border-zinc-800/60 bg-zinc-900/50">
      <CardHeader className="flex-row items-center justify-between pb-1">
        <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
          {label}
        </span>
        <span className="text-zinc-500">{icon}</span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <span className="text-2xl font-semibold font-mono tracking-tight text-zinc-100">
            {value}
          </span>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [squads, setSquads] = useState<Squad[]>([])
  const [squadsTotal, setSquadsTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, squadsRes] = await Promise.all([
          fetch('/api/metrics/dashboard'),
          fetch('/api/squads?limit=6'),
        ])

        if (!metricsRes.ok || !squadsRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const metricsJson = await metricsRes.json()
        const squadsJson = await squadsRes.json()

        setMetrics(metricsJson.data)
        setSquads(squadsJson.data)
        setSquadsTotal(squadsJson.meta?.total ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const activeRuns =
    metrics?.recentRuns.filter((r) => r.status === 'running').length ?? 0

  return (
    <>
      <AppHeader
        title="Dashboard"
        description="Mission control"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" render={<Link href="/templates" />}>
              Browse Templates
            </Button>
            <Button size="sm" render={<Link href="/squads/new" />}>
              <Plus className="size-3.5" />
              New Squad
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
            {getGreeting()} <span className="text-amber-400">.</span>
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Here is what is happening with your squads today.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Squads"
            value={String(metrics?.totalSquads ?? 0)}
            icon={<Users className="size-4" />}
            loading={loading}
          />
          <MetricCard
            label="Runs Today"
            value={String(metrics?.runsToday ?? 0)}
            icon={<Zap className="size-4" />}
            loading={loading}
          />
          <MetricCard
            label="Cost Today"
            value={formatCost(metrics?.costToday ?? null)}
            icon={<DollarSign className="size-4" />}
            loading={loading}
          />
          <MetricCard
            label="Active Runs"
            value={String(activeRuns)}
            icon={<Activity className="size-4" />}
            loading={loading}
          />
        </div>

        {/* Your Squads */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Your Squads
            </h3>
            {squadsTotal > 6 && (
              <Link
                href="/squads"
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors"
              >
                View all ({squadsTotal})
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-zinc-800/60 bg-zinc-900/50">
                  <CardContent className="space-y-3 pt-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : squads.length === 0 ? (
            <Card className="border-zinc-800/60 bg-zinc-900/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-zinc-800">
                  <Users className="size-5 text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-zinc-300">
                  No squads yet
                </p>
                <p className="mt-1 max-w-xs text-xs text-zinc-500">
                  Squads are teams of AI agents that work together. Create your
                  first squad to get started.
                </p>
                <Button
                  size="sm"
                  className="mt-4"
                  render={<Link href="/squads/new" />}
                >
                  <Plus className="size-3.5" />
                  Create your first squad
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {squads.map((squad) => (
                <Link key={squad.id} href={`/squads/${squad.id}`}>
                  <Card className="border-zinc-800/60 bg-zinc-900/50 transition-colors hover:border-zinc-700 hover:bg-zinc-900/80 cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">
                          {squad.icon ?? '🤖'}
                        </span>
                        <CardTitle className="text-sm text-zinc-200">
                          {squad.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {truncate(squad.description, 80) || 'No description'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Users className="size-3" />
                          {squad.agentCount}{' '}
                          {squad.agentCount === 1 ? 'agent' : 'agents'}
                        </span>
                        {squad.lastRun && statusBadge(squad.lastRun.status)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Runs */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            Recent Runs
          </h3>

          {loading ? (
            <Card className="border-zinc-800/60 bg-zinc-900/50">
              <CardContent className="space-y-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : !metrics?.recentRuns.length ? (
            <Card className="border-zinc-800/60 bg-zinc-900/50">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Clock className="size-5 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500">
                  No runs yet. Execute a squad to see results here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-zinc-800/60 bg-zinc-900/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800/60 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      <th className="px-4 py-3">Squad</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Cost</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {metrics.recentRuns.map((run) => (
                      <tr
                        key={run.id}
                        className="group transition-colors hover:bg-zinc-800/30 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/squads/${run.squad.id}/runs/${run.id}`}
                            className="flex items-center gap-2 text-zinc-300 group-hover:text-amber-400 transition-colors"
                          >
                            <span className="text-sm leading-none">
                              {run.squad.icon ?? '🤖'}
                            </span>
                            {run.squad.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{statusBadge(run.status)}</td>
                        <td className="px-4 py-3 font-mono text-zinc-400">
                          {formatDuration(run.duration)}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-400">
                          {formatCost(run.totalCost)}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-500">
                          {formatDate(run.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>
      </div>
    </>
  )
}

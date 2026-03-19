'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Zap,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardMetrics {
  totalSquads: number
  runsToday: number
  costToday: number
  activeRuns: number
  systemHealth: number
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
  gradient: string | null
  agentCount: number
  lastRun: { id: string; status: string; createdAt: string } | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCost(value: number | null): string {
  if (value == null) return '$0.00'
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(2)}`
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '--'
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

// ---------------------------------------------------------------------------
// Metric Card
// ---------------------------------------------------------------------------

function MetricCard({ label, value, change, progress, loading }: {
  label: string; value: string; change?: { value: string; type: 'up' | 'down' | 'stable' }; progress?: number; loading: boolean
}) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:-translate-y-0.5 transition-all border border-white/60 bg-white/45 backdrop-blur-[16px]">
      {/* Blue top bar */}
      <div className="h-0.5 bg-[#0066ff]" />
      <div className="p-5 flex flex-col">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
        {loading ? (
          <Skeleton className="h-9 w-20 mt-1" />
        ) : (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
            {change && (
              <span className={`text-xs font-bold ${change.type === 'up' ? 'text-emerald-500' : change.type === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
                {change.value}
              </span>
            )}
          </div>
        )}
        <div className="mt-auto pt-4 w-full h-1 bg-slate-200/30 rounded-full overflow-hidden">
          <div className="bg-[#0066ff] h-full rounded-full transition-all duration-1000" style={{ width: loading ? '0%' : `${progress ?? 0}%` }} />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Squad Card - altura fixa, identico ao Stitch
// ---------------------------------------------------------------------------

function SquadCard({ squad }: { squad: Squad }) {
  const isActive = squad.lastRun?.status === 'running'

  return (
    <Link href={`/squads/${squad.id}`} className="block group">
      <div className="relative bg-white/40 backdrop-blur-md border border-slate-200/60 rounded-2xl overflow-hidden hover:ring-2 hover:ring-[#0066ff]/40 transition-all shadow-sm">
        {/* Preview area - altura fixa com gradiente do squad */}
        <div className="h-28 bg-slate-100/50 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: squad.gradient || 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, transparent 100%)' }}
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 backdrop-blur-sm ${isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isActive ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-md">
            <span className="bg-white text-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg">Manage Squad</span>
          </div>
        </div>
        {/* Info - altura fixa */}
        <div className="p-4 h-24 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900">{squad.name}</h4>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase">
              {squad.lastRun ? `Last run: ${timeAgo(squad.lastRun.createdAt)}` : 'No runs yet'}
            </p>
          </div>
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(squad.agentCount, 2) }).map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200" />
            ))}
            {squad.agentCount > 0 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100/50 flex items-center justify-center text-[10px] font-bold text-slate-500">
                +{Math.max(squad.agentCount - 2, 0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Run Item - identico ao Stitch
// ---------------------------------------------------------------------------

const RUN_STATUS: Record<string, { icon: typeof CheckCircle2; bg: string; text: string }> = {
  completed: { icon: CheckCircle2, bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  running: { icon: Loader2, bg: 'bg-[#0066ff]/10', text: 'text-[#0066ff]' },
  failed: { icon: XCircle, bg: 'bg-rose-500/10', text: 'text-rose-500' },
  queued: { icon: Clock, bg: 'bg-slate-500/10', text: 'text-slate-400' },
  pending: { icon: Clock, bg: 'bg-slate-500/10', text: 'text-slate-400' },
  cancelled: { icon: XCircle, bg: 'bg-slate-500/10', text: 'text-slate-400' },
}

function RunItem({ run }: { run: RecentRun }) {
  const cfg = (RUN_STATUS[run.status] ?? RUN_STATUS.queued)!
  const Icon = cfg.icon
  const isRunning = run.status === 'running'
  const isFailed = run.status === 'failed'

  // Gerar um nome de run estilo Stitch (uppercase com underscore)
  const runName = run.squad.name.toUpperCase().replace(/\s+/g, '_')

  return (
    <Link
      href={`/squads/${run.squad.id}/runs/${run.id}`}
      className="p-4 flex items-center justify-between hover:bg-white/40 cursor-pointer group transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center ${cfg.text} shrink-0`}>
          <Icon className={`size-5 ${isRunning ? 'animate-spin' : ''}`} style={isRunning ? { animationDuration: '3s' } : undefined} />
        </div>
        <div className="font-mono min-w-0">
          <p className="text-xs font-bold truncate text-slate-900 group-hover:text-[#0066ff] transition-colors">
            {runName}
          </p>
          <p className="text-[9px] text-slate-400 uppercase font-medium truncate">
            {run.squad.name} · {isRunning ? 'RUNNING' : timeAgo(run.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {isRunning ? (
          <span className="text-[10px] font-mono text-[#0066ff] font-bold animate-pulse">EXECUTING</span>
        ) : isFailed ? (
          <span className="text-[10px] font-mono text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded">ERR_504</span>
        ) : (
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100/50 px-2 py-0.5 rounded">{formatDuration(run.duration)}</span>
        )}
        <MoreHorizontal className="size-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [squads, setSquads] = useState<Squad[]>([])
  const [squadsTotal, setSquadsTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)
      const [metricsRes, squadsRes] = await Promise.all([
        fetch('/api/metrics/dashboard'),
        fetch('/api/squads?limit=6'),
      ])
      if (!metricsRes.ok || !squadsRes.ok) throw new Error('Failed to fetch dashboard data')
      const metricsJson = await metricsRes.json()
      const squadsJson = await squadsRes.json()
      setMetrics(metricsJson.data)
      setSquads(squadsJson.data)
      setSquadsTotal(squadsJson.meta?.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const hasSquads = squads.length > 0
  const hasRuns = (metrics?.recentRuns.length ?? 0) > 0

  return (
    <>
      <AppHeader
        title="Project Overview"
        description="Dashboard"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/squads/new"
              className="bg-[#0066ff] text-white text-sm px-4 py-1.5 rounded-lg font-bold hover:bg-[#0066ff]/90 flex items-center gap-2 shadow-lg shadow-[#0066ff]/20"
            >
              <Plus className="size-3.5" />
              New Squad
            </Link>
          </div>
        }
      />

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Metric HUD */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Total Squads" value={String(metrics?.totalSquads ?? 0)} progress={70} loading={loading} />
          <MetricCard label="Runs Today" value={String(metrics?.runsToday ?? 0)} progress={45} loading={loading} />
          <MetricCard label="Estimated Cost" value={formatCost(metrics?.costToday ?? null)} progress={85} loading={loading} />
          <MetricCard label="Active Instances" value={String(metrics?.activeRuns ?? 0)} change={{ value: 'STABLE', type: 'stable' }} progress={60} loading={loading} />
        </section>

        {/* Main grid: Squads (2col) + Runs (1col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* === Left: Your Squads === */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Your Squads</h3>
              {squadsTotal > 0 && (
                <Link href="/squads" className="text-[#0066ff] text-xs font-bold hover:underline uppercase tracking-widest">
                  View all
                </Link>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-52 rounded-2xl" />
                <Skeleton className="h-52 rounded-2xl" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {squads.slice(0, 3).map((squad) => (
                  <SquadCard key={squad.id} squad={squad} />
                ))}
                {/* Ghost card: Create New Squad - sempre visivel */}
                <Link href="/squads/new" className="block h-full">
                  <div className="rounded-2xl p-6 border-2 border-dashed border-slate-200 hover:border-[#0066ff]/40 hover:bg-white transition-all flex flex-col items-center justify-center text-center group h-full cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0066ff]/10 group-hover:text-[#0066ff] transition-colors mb-3">
                      <Plus className="size-7" />
                    </div>
                    <h3 className="font-bold text-slate-500 group-hover:text-[#0066ff]">Create New Squad</h3>
                    <p className="text-slate-400 text-xs mt-1">Start from squad or a template</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* === Right: Recent Runs + Efficiency === */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Recent Runs</h3>
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="text-slate-400 hover:text-[#0066ff] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`size-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="bg-white/45 backdrop-blur-[16px] border border-white/60 rounded-2xl p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : !hasRuns ? (
              <div className="bg-white/45 backdrop-blur-[16px] border border-white/60 rounded-2xl p-8 text-center">
                <Clock className="size-5 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No runs yet</p>
              </div>
            ) : (
              <div className="bg-white/45 backdrop-blur-[16px] border border-white/60 rounded-2xl divide-y divide-slate-200/40 overflow-hidden">
                {metrics!.recentRuns.map((run) => (
                  <RunItem key={run.id} run={run} />
                ))}
              </div>
            )}

            {/* Efficiency Index */}
            <div className="bg-[#0066ff]/5 backdrop-blur-[16px] border border-[#0066ff]/20 p-5 rounded-2xl">
              <h4 className="text-[10px] font-bold text-[#0066ff] uppercase tracking-[0.2em] mb-3">
                Efficiency Index
              </h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-600 font-medium">System Health</span>
                <span className="text-xs font-mono font-bold text-emerald-500">
                  {loading ? '--' : `${metrics?.systemHealth ?? 0}%`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/30 rounded-full">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                  style={{
                    width: loading ? '0%' : `${metrics?.systemHealth ?? 0}%`,
                    boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

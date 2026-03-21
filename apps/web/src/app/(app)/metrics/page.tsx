'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Wallet,
  TrendingUp,
  Hash,
  Server,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Bot,
  ArrowUpDown,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { GlassPanel } from '@/components/shared/glass-panel'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCost } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CostData {
  costToday: number
  costYesterday: number
  costChangePercent: number
  monthlyCostEstimate: number
  totalTokens: number
  totalCost: number
  tokensToday: number
  costBySquad: SquadCost[]
  runs: CostRun[]
  totalRuns: number
  page: number
  limit: number
}

interface SquadCost {
  squadId: string
  name: string
  icon: string | null
  totalCost: number
  totalTokens: number
  runCount: number
}

interface CostRun {
  id: string
  status: string
  totalTokens: number
  totalCost: number
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  squad: { id: string; name: string; icon: string | null }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTokens(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`
  return String(v)
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

function formatDuration(start: string | null, end: string | null): string {
  if (!start) return '-'
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime()
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

const DATE_FILTERS = [
  { labelKey: 'last7days' as const, days: 7 },
  { labelKey: 'last30days' as const, days: 30 },
  { labelKey: 'last90days' as const, days: 90 },
]

const RUNS_PER_PAGE = 10

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, label, value, subtitle, change, loading }: {
  icon: typeof Wallet; label: string; value: string; subtitle?: string
  change?: { value: string; type: 'up' | 'down' }; loading: boolean
}) {
  return (
    <GlassPanel accent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#0066ff] bg-[#0066ff]/10 p-2 rounded-lg">
          <Icon className="size-5" />
        </span>
        {change && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            change.type === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
          }`}>{change.value}</span>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      {loading ? <Skeleton className="h-9 w-24 mt-1" /> : <p className="text-3xl font-bold mt-1">{value}</p>}
      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </GlassPanel>
  )
}

// ---------------------------------------------------------------------------
// Token Usage Bar
// ---------------------------------------------------------------------------

function TokenBar({ label, tokens, maxTokens, color }: {
  label: string; tokens: number; maxTokens: number; color: string
}) {
  const pct = maxTokens > 0 ? (tokens / maxTokens) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-sm text-slate-500">{formatTokens(tokens)} tokens</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cost Bar Chart
// ---------------------------------------------------------------------------

function CostBarChart({ squads }: { squads: SquadCost[] }) {
  const nonZero = squads.filter((s) => s.totalCost > 0)

  if (nonZero.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">No cost data available yet.</p>
  }

  const maxCost = Math.max(...nonZero.map((s) => s.totalCost))
  const BAR_MAX_HEIGHT = 160
  const BAR_MIN_HEIGHT = 24

  return (
    <div className="flex items-end gap-4" style={{ height: BAR_MAX_HEIGHT + 40 }}>
      {nonZero.slice(0, 6).map((squad) => {
        const barHeight = maxCost > 0
          ? Math.max(Math.round((squad.totalCost / maxCost) * BAR_MAX_HEIGHT), BAR_MIN_HEIGHT)
          : BAR_MIN_HEIGHT

        return (
          <div key={squad.squadId} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
            <div
              className="w-full bg-[#0066ff]/20 rounded-t-lg relative group cursor-pointer"
              style={{ height: barHeight }}
            >
              <div className="absolute inset-x-0 bottom-0 bg-[#0066ff] rounded-t-lg transition-all group-hover:!h-full" style={{ height: '75%' }} />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                {formatCost(squad.totalCost)}
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase text-center truncate w-full">
              {squad.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sortable Table Header
// ---------------------------------------------------------------------------

function SortHeader({ label, field, currentField, currentDir, onSort, align }: {
  label: string
  field: string
  currentField: string | null
  currentDir: string
  onSort: (field: string) => void
  align?: 'right'
}) {
  const isActive = currentField === field
  return (
    <th className={`px-6 py-4 ${align === 'right' ? 'text-right' : ''}`}>
      <button
        onClick={() => onSort(field)}
        className={`flex items-center gap-1 hover:text-[#0066ff] transition-colors ${align === 'right' ? 'ml-auto' : ''}`}
      >
        {label}
        <ArrowUpDown className={`size-3 ${isActive ? 'text-[#0066ff]' : 'opacity-40'}`} />
        {isActive && (
          <span className="text-[8px] text-[#0066ff] font-bold">{currentDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </button>
    </th>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MetricsPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [activeFilter, setActiveFilter] = useState(1)
  const [runSearch, setRunSearch] = useState('')
  const [runPage, setRunPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const toggleSort = useCallback((field: string) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
        return field
      }
      setSortDir('desc')
      return field
    })
    setRunPage(1)
  }, [])

  // Fetch data - reacts to all server-side params
  useEffect(() => {
    const controller = new AbortController()

    async function fetchCosts() {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({
          days: String(days),
          page: String(runPage),
          limit: String(RUNS_PER_PAGE),
        })
        if (runSearch.trim()) params.set('search', runSearch.trim())
        if (sortField) {
          params.set('sortBy', sortField)
          params.set('sortDir', sortDir)
        }

        const res = await fetch(`/api/metrics/costs?${params}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to load metrics')
        const json = await res.json()
        setData(json.data)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchCosts, runSearch ? 300 : 0)
    return () => { clearTimeout(debounce); controller.abort() }
  }, [days, runPage, runSearch, sortField, sortDir])

  // Reset page on search change
  useEffect(() => { setRunPage(1) }, [runSearch])

  const totalRunPages = data ? Math.max(1, Math.ceil(data.totalRuns / RUNS_PER_PAGE)) : 1
  const maxTokens = data?.costBySquad.reduce((max, s) => Math.max(max, s.totalTokens), 0) ?? 0

  return (
    <>
      <AppHeader
        title={t.metrics.title}
        description={t.metrics.subtitle}
      />

      {/* Date filter */}
      <div className="px-8 py-6 flex items-center gap-4 shrink-0">
        <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200">
          {DATE_FILTERS.map((filter, i) => (
            <button
              key={filter.days}
              onClick={() => { setActiveFilter(i); setDays(filter.days); setRunPage(1) }}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeFilter === i
                  ? 'bg-[#0066ff] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {i === 0 && <Calendar className="size-3.5" />}
              {t.metrics[filter.labelKey]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-12">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">{error}</div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Wallet}
            label={t.metrics.costToday}
            value={formatCost(data?.costToday ?? 0)}
            subtitle={`${t.metrics.vsYesterday}: ${formatCost(data?.costYesterday ?? 0)}`}
            change={data && data.costChangePercent !== 0 ? {
              value: `${data.costChangePercent > 0 ? '+' : ''}${data.costChangePercent}%`,
              type: data.costChangePercent > 0 ? 'up' : 'down',
            } : undefined}
            loading={loading}
          />
          <StatCard
            icon={TrendingUp}
            label={t.metrics.estMonthlyCost}
            value={formatCost(data?.monthlyCostEstimate ?? 0)}
            subtitle={t.metrics.projectedFromToday}
            loading={loading}
          />
          <StatCard
            icon={Hash}
            label={t.metrics.totalTokens}
            value={formatTokens(data?.totalTokens ?? 0)}
            subtitle={`${t.metrics.tokensToday}: ${formatTokens(data?.tokensToday ?? 0)}`}
            loading={loading}
          />
          <StatCard
            icon={Server}
            label="Local Runs (Savings)"
            value="$0.00"
            subtitle="No local model configured"
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GlassPanel accent className="p-6">
            <h3 className="font-bold text-lg mb-6">{t.metrics.tokenDistribution}</h3>
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : data?.costBySquad.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-12">No data available yet.</p>
            ) : (
              <div className="space-y-6">
                {data?.costBySquad.slice(0, 5).map((squad, i) => {
                  const colors = ['bg-[#0066ff]', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
                  return (
                    <TokenBar
                      key={squad.squadId}
                      label={squad.name}
                      tokens={squad.totalTokens}
                      maxTokens={maxTokens}
                      color={colors[i % colors.length]!}
                    />
                  )
                })}
              </div>
            )}
          </GlassPanel>

          <GlassPanel accent className="p-6">
            <h3 className="font-bold text-lg mb-6">{t.metrics.costBySquad}</h3>
            {loading ? <Skeleton className="h-48 w-full" /> : <CostBarChart squads={data?.costBySquad ?? []} />}
          </GlassPanel>
        </div>

        {/* Recent Agent Runs */}
        <GlassPanel accent className="overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-lg">{t.metrics.recentRuns}</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                className="pl-9 pr-4 py-1.5 text-sm bg-slate-100 border-none rounded-lg focus:ring-1 focus:ring-[#0066ff] w-64 outline-none"
                placeholder="Search runs..."
                value={runSearch}
                onChange={(e) => setRunSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !data?.runs.length ? (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-400">{runSearch ? 'No runs match your search.' : 'No runs yet.'}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">{t.metrics.squad}</th>
                      <SortHeader label={t.metrics.duration} field="duration" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                      <SortHeader label={t.metrics.tokens} field="tokens" currentField={sortField} currentDir={sortDir} onSort={toggleSort} align="right" />
                      <SortHeader label={t.metrics.cost} field="cost" currentField={sortField} currentDir={sortDir} onSort={toggleSort} align="right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.runs.map((run) => (
                      <tr key={run.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <td className="px-6 py-4">
                          <Link href={`/squads/${run.squad.id}/runs/${run.id}`} className="flex flex-col hover:text-[#0066ff]">
                            <span className="text-sm font-semibold font-mono text-[#0066ff]">#{run.id.slice(-8).toUpperCase()}</span>
                            <span className="text-[10px] text-slate-400">{timeAgo(run.createdAt)}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="size-6 bg-[#0066ff]/10 rounded flex items-center justify-center">
                              <Bot className="size-3 text-[#0066ff]" />
                            </div>
                            <span className="text-sm font-medium">{run.squad.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatDuration(run.startedAt ?? run.createdAt, run.completedAt)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">{run.totalTokens.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold">{formatCost(run.totalCost)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  Showing {data.runs.length} of {data.totalRuns} runs
                </span>
                {totalRunPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRunPage((p) => Math.max(1, p - 1))}
                      disabled={runPage === 1}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalRunPages, 5) }).map((_, i) => {
                        // Show pages around current page
                        let pageNum: number
                        if (totalRunPages <= 5) {
                          pageNum = i + 1
                        } else if (runPage <= 3) {
                          pageNum = i + 1
                        } else if (runPage >= totalRunPages - 2) {
                          pageNum = totalRunPages - 4 + i
                        } else {
                          pageNum = runPage - 2 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setRunPage(pageNum)}
                            className={`w-7 h-7 rounded text-xs font-bold ${
                              runPage === pageNum ? 'bg-[#0066ff] text-white' : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => setRunPage((p) => Math.min(totalRunPages, p + 1))}
                      disabled={runPage === totalRunPages}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </GlassPanel>
      </div>
    </>
  )
}

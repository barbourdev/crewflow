'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'

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
  gradient: string | null
  code: string
  version: string
  agentCount: number
  lastRun: LastRun | null
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function lastRunLabel(squad: Squad): string {
  if (!squad.lastRun) return 'No runs'
  if (squad.lastRun.status === 'running') return 'Active'
  return timeAgo(squad.lastRun.createdAt)
}

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  completed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Completed' },
  running: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Running' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Failed' },
  paused: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Paused' },
  pending: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Pending' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Cancelled' },
}

// Fallback gradient se o squad nao tem um salvo
const DEFAULT_GRADIENT = 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.08) 100%)'

// Icone placeholder baseado no emoji do squad
function SquadIcon({ icon, gradient }: { icon: string; gradient: string | null }) {
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg shrink-0"
      style={{ background: gradient || DEFAULT_GRADIENT }}
    >
      {icon || '🤖'}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Squad Card - fiel ao Stitch
// ---------------------------------------------------------------------------

function SquadCard({ squad }: { squad: Squad }) {
  const status = squad.lastRun?.status
  const badge = status ? (STATUS_BADGE[status] ?? STATUS_BADGE.pending)! : null

  return (
    <Link href={`/squads/${squad.id}`} className="group block h-full">
      <div className="bg-white/70 backdrop-blur-[12px] border border-white/30 rounded-2xl p-6 shadow-xl shadow-slate-200/50 hover:shadow-[#0066ff]/10 transition-all group h-full flex flex-col">
        {/* Top: icon + status */}
        <div className="flex justify-between items-start mb-4">
          <SquadIcon icon={squad.icon} gradient={squad.gradient} />
          {badge && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${status === 'running' ? 'animate-pulse' : ''}`} />
              {badge.label}
            </span>
          )}
        </div>

        {/* Name + description */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0066ff] transition-colors">
          {squad.name}
        </h3>
        <p className="text-slate-500 text-sm mt-1 mb-6 leading-relaxed line-clamp-2">
          {squad.description || 'No description'}
        </p>

        {/* Metrics: Agents | Version | Last Run */}
        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 mt-auto">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Agents</p>
            <p className="text-sm font-semibold text-slate-700">
              {squad.agentCount} agent{squad.agentCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Version</p>
            <p className="text-sm font-semibold text-slate-700">v{squad.version}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Last Run</p>
            <p className="text-sm font-semibold text-slate-700">{lastRunLabel(squad)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SquadCardSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-[12px] border border-white/30 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-20 h-5 rounded-full" />
      </div>
      <Skeleton className="h-5 w-40 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-6" />
      <div className="border-t border-slate-100 pt-5 mt-2 grid grid-cols-3 gap-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const PAGE_SIZE = 9 // 3x3 grid, ultimo slot e o "Create New Squad"

export default function SquadsPage() {
  const { t } = useTranslation()
  const [squads, setSquads] = useState<Squad[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function fetchSquads() {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          page: String(page),
        })
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
  }, [search, page])

  // Reset page on search
  useEffect(() => { setPage(1) }, [search])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <AppHeader
        title={t.squads.title}
        description={t.squads.subtitle}
        actions={
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.squads.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-72 focus:ring-2 focus:ring-[#0066ff]/50 outline-none transition-all"
              />
            </div>
            <Link
              href="/squads/new"
              className="bg-[#0066ff] text-white text-sm px-4 py-1.5 rounded-lg font-bold hover:bg-[#0066ff]/90 flex items-center gap-2 shadow-lg shadow-[#0066ff]/20"
            >
              <Plus className="size-3.5" />
              {t.dashboard.newSquad}
            </Link>
          </div>
        }
      />

      <div className="p-8 max-w-[1600px] mx-auto">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SquadCardSkeleton key={i} />
            ))}
          </div>
        ) : squads.length === 0 && !search ? (
          /* Empty state - no squads at all */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0066ff]/10 flex items-center justify-center mb-4">
              <Users className="size-8 text-[#0066ff]" />
            </div>
            <h3 className="text-lg font-bold mb-1">{t.squads.noSquads}</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-6">
              {t.squads.createSquad}
            </p>
            <Link
              href="/squads/new"
              className="bg-[#0066ff] text-white text-sm px-6 py-2.5 rounded-lg font-bold hover:bg-[#0066ff]/90 flex items-center gap-2 shadow-lg shadow-[#0066ff]/20"
            >
              <Plus className="size-4" />
              {t.squads.createSquad}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {squads.map((squad) => (
                <SquadCard key={squad.id} squad={squad} />
              ))}

              {/* Ghost card: Create New Squad - mesma altura que os outros */}
              <Link href="/squads/new" className="block h-full">
                <div className="rounded-2xl p-6 border-2 border-dashed border-slate-200 hover:border-[#0066ff]/40 hover:bg-white transition-all flex flex-col items-center justify-center text-center group h-full cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0066ff]/10 group-hover:text-[#0066ff] transition-colors mb-3">
                    <Plus className="size-7" />
                  </div>
                  <h3 className="font-bold text-slate-500 group-hover:text-[#0066ff]">{t.dashboard.createNewSquad}</h3>
                  <p className="text-slate-400 text-xs mt-1">{t.dashboard.startFromSquad}</p>
                </div>
              </Link>
            </div>

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-between py-6 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-700">{squads.length}</span> of{' '}
                <span className="font-bold text-slate-700">{total}</span> squads
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                          page === i + 1
                            ? 'bg-[#0066ff] text-white'
                            : 'text-slate-600 hover:bg-white'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

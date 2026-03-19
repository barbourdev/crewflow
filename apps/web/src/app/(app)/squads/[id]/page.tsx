'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Pause,
  Trash2,
  Eye,
  Zap,
  Search,
  PenLine,
  ShieldCheck,
  Send,
  Bot,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { ErrorBanner } from '@/components/shared/error-banner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Skill {
  id: string
  skill: { id: string; name: string; type: string }
}

interface Agent {
  id: string
  name: string
  icon: string
  role: string
  skills: Skill[]
}

interface PipelineStep {
  id: string
  order: number
  label: string
  type: string
  agentId: string | null
  agent?: Agent
}

interface Pipeline {
  id: string
  steps: PipelineStep[]
}

interface RunStepInfo {
  id: string
  status: string
  step: { id: string; order: number; label: string; type: string }
}

interface Run {
  id: string
  status: string
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  totalTokens: number
  totalCost: number
  _count: { steps: number }
  steps: RunStepInfo[]
}

interface SquadDetail {
  id: string
  name: string
  description: string | null
  icon: string
  code: string
  version: string
  agents: Agent[]
  pipeline: Pipeline | null
  runs: Run[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(start: string | null, end: string | null): string {
  if (!start) return '-'
  const startMs = new Date(start).getTime()
  const endMs = end ? new Date(end).getTime() : Date.now()
  const seconds = Math.floor((endMs - startMs) / 1000)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
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

const RUN_STATUS: Record<string, { icon: typeof CheckCircle2; bg: string; text: string; label: string }> = {
  completed: { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Success' },
  running: { icon: Loader2, bg: 'bg-blue-50', text: 'text-blue-600', label: 'Running' },
  failed: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-600', label: 'Failed' },
  paused: { icon: Pause, bg: 'bg-amber-50', text: 'text-amber-600', label: 'Paused' },
  pending: { icon: Clock, bg: 'bg-slate-50', text: 'text-slate-500', label: 'Pending' },
  cancelled: { icon: XCircle, bg: 'bg-slate-50', text: 'text-slate-500', label: 'Cancelled' },
}

// Icone Lucide por tipo de step (sem emojis)
const STEP_ICON_MAP: Record<string, typeof Search> = {
  inline: PenLine,
  subagent: Search,
  checkpoint: ShieldCheck,
}

// Status do squad baseado nos runs
function getSquadStatus(runs: Run[]): { label: string; bg: string; text: string; dot: string; dotAnim: boolean } {
  const latestRun = runs[0]
  if (!latestRun) return { label: 'Idle', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', dotAnim: false }
  if (latestRun.status === 'running') return { label: 'Running', bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500', dotAnim: true }
  if (latestRun.status === 'paused') return { label: 'Paused', bg: 'bg-amber-100', text: 'text-amber-600', dot: 'bg-amber-500', dotAnim: false }
  return { label: 'Idle', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', dotAnim: false }
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex gap-5 items-center">
        <Skeleton className="size-16 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <Skeleton className="h-10 w-80" />
      <div className="grid grid-cols-3 gap-5">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent Card - icones Lucide, sem emojis
// ---------------------------------------------------------------------------

function AgentCard({ agent, isWorking }: { agent: Agent; isWorking: boolean }) {
  return (
    <div className={`bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#0066ff]/50 transition-all group shadow-sm ${isWorking ? 'ring-1 ring-[#0066ff]/5' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`size-12 ${isWorking ? 'bg-[#0066ff]/10' : 'bg-slate-100'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-2xl`}>
          {agent.icon || <Bot className="size-6 text-[#0066ff]" />}
        </div>
        <span className={`px-2 py-1 ${isWorking ? 'bg-[#0066ff]/10 text-[#0066ff]' : 'bg-slate-100 text-slate-500'} text-[10px] font-bold uppercase tracking-widest rounded`}>
          {agent.name.replace(/\s+/g, '_').toUpperCase()}
        </span>
      </div>
      <h4 className="text-slate-900 font-bold text-base mb-1">{agent.name}</h4>
      <p className="text-slate-500 text-sm leading-relaxed mb-4">{agent.role}</p>
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${isWorking ? 'bg-[#0066ff] animate-pulse shadow-sm shadow-[#0066ff]' : 'bg-slate-300'}`} />
          <span className={`text-xs font-semibold ${isWorking ? 'text-[#0066ff]' : 'text-slate-400'}`}>
            {isWorking ? 'Working' : 'Idle'}
          </span>
        </div>
        <span className="text-xs text-slate-400">
          <Zap className="size-3 inline mr-0.5" />
          {agent.skills.length} skill{agent.skills.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pipeline horizontal - status real, tudo cinza se nao esta rodando
// ---------------------------------------------------------------------------

function PipelinePreview({ steps, latestRun }: { steps: PipelineStep[]; latestRun: Run | null }) {
  if (steps.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-12 rounded-2xl shadow-sm text-center">
        <p className="text-sm text-slate-400">No pipeline steps configured.</p>
      </div>
    )
  }

  // So mostrar status colorido se o run esta ativo (running/paused)
  // Se completou ou falhou, pipeline volta a ficar idle (cinza)
  const isActive = latestRun?.status === 'running' || latestRun?.status === 'paused'
  const runStepStatus = new Map<string, string>()
  if (latestRun && isActive) {
    for (const rs of latestRun.steps) {
      runStepStatus.set(rs.step.id, rs.status)
    }
  }

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />

        {steps.map((step, i) => {
          const StepIcon = STEP_ICON_MAP[step.type] ?? PenLine
          const status = runStepStatus.get(step.id)
          const isCompleted = status === 'completed'
          const isActive = status === 'running'
          const isFailed = status === 'failed'
          const isPending = !status || status === 'pending' || status === 'queued'

          return (
            <div key={step.id} className={`flex flex-col items-center gap-4 z-10 bg-white px-4 ${isPending && !isActive ? 'opacity-50' : ''}`}>
              <div className={`size-10 rounded-full flex items-center justify-center ${
                isCompleted
                  ? 'bg-emerald-500 text-white ring-8 ring-emerald-500/5'
                  : isActive
                    ? 'bg-[#0066ff] text-white ring-8 ring-[#0066ff]/10 animate-pulse'
                    : isFailed
                      ? 'bg-red-500 text-white ring-8 ring-red-500/5'
                      : 'border-2 border-slate-200 bg-slate-50 text-slate-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="size-5" />
                ) : isActive ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : isFailed ? (
                  <XCircle className="size-5" />
                ) : (
                  <StepIcon className="size-4" />
                )}
              </div>
              <div className="text-center">
                <p className="text-slate-900 font-bold text-sm">{step.label}</p>
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-tighter">
                  Phase {String(i + 1).padStart(2, '0')}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Runs table
// ---------------------------------------------------------------------------

function RunsTable({ runs, squadId }: { runs: Run[]; squadId: string }) {
  if (runs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-12 rounded-2xl shadow-sm text-center">
        <Play className="size-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No runs yet. Start your first run.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Run ID</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Started</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {runs.map((run) => {
            const cfg = (RUN_STATUS[run.status] ?? RUN_STATUS.pending)!
            const Icon = cfg.icon
            return (
              <tr key={run.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-[#0066ff] font-bold">
                  #{run.id.slice(-8).toUpperCase()}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {run.startedAt ? formatDate(run.startedAt) : formatDate(run.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatDuration(run.startedAt ?? run.createdAt, run.completedAt)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${cfg.bg} ${cfg.text} text-xs font-bold`}>
                    <Icon className={`size-3.5 ${run.status === 'running' ? 'animate-spin' : ''}`} />
                    {cfg.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/squads/${squadId}/runs/${run.id}`} className="text-slate-400 hover:text-[#0066ff] transition-colors">
                    <Eye className="size-5" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SquadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const [squad, setSquad] = useState<SquadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingRun, setStartingRun] = useState(false)
  const [runDialogOpen, setRunDialogOpen] = useState(false)
  const [runInput, setRunInput] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'runs'>('overview')

  const handleDelete = useCallback(async () => {
    if (!confirm('Tem certeza que deseja excluir este squad?')) return
    try {
      const res = await fetch(`/api/squads/${id}`, { method: 'DELETE' })
      if (res.ok) router.push('/squads')
    } catch { /* ignore */ }
  }, [id, router])

  const handleStartRun = useCallback(async () => {
    if (startingRun) return
    setStartingRun(true)
    try {
      const res = await fetch(`/api/squads/${id}/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { prompt: runInput.trim() } }),
      })
      if (!res.ok) throw new Error('Falha ao criar run')
      const json = (await res.json()) as { data: { id: string } }
      setRunDialogOpen(false)
      setRunInput('')
      router.push(`/squads/${id}/runs/${json.data.id}`)
    } catch {
      setStartingRun(false)
    }
  }, [id, startingRun, runInput, router])

  useEffect(() => {
    async function fetchSquad() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/squads/${id}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error('Squad not found')
          throw new Error('Failed to load squad')
        }
        const json = (await res.json()) as { data: SquadDetail }
        setSquad(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchSquad()
  }, [id])

  if (loading) {
    return (
      <>
        <AppHeader title="Squad Details" description="Loading" />
        <DetailSkeleton />
      </>
    )
  }

  if (error || !squad) {
    return (
      <>
        <AppHeader title="Squad Details" />
        <div className="p-8 max-w-[1600px] mx-auto">
          <ErrorBanner message={error ?? 'Squad not found'} />
        </div>
      </>
    )
  }

  const squadStatus = getSquadStatus(squad.runs)
  const hasRunning = squad.runs.some((r) => r.status === 'running')
  const lastRunTime = squad.runs[0] ? timeAgo(squad.runs[0].createdAt) : null

  return (
    <>
      <AppHeader
        title="Squad Details"
        description="Manage agents, pipeline and runs"
      />

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Squad Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex gap-5 items-center">
            <div className="bg-[#0066ff]/10 p-4 rounded-2xl ring-1 ring-[#0066ff]/20 text-3xl">
              {squad.icon || <Bot className="size-8 text-[#0066ff]" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{squad.name}</h1>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 uppercase tracking-wider ${squadStatus.bg} ${squadStatus.text}`}>
                  <span className={`size-1.5 rounded-full ${squadStatus.dot} ${squadStatus.dotAnim ? 'animate-pulse' : ''}`} />
                  {squadStatus.label}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium mt-1">
                v{squad.version} · {squad.agents.length} Agent{squad.agents.length !== 1 ? 's' : ''}
                {lastRunTime && ` · Last run ${lastRunTime}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center justify-center rounded-xl h-12 px-4 bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200"
            >
              <Trash2 className="size-5" />
            </button>

            <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
              <DialogTrigger
                render={
                  <button className="flex items-center justify-center rounded-xl h-12 px-8 bg-[#0066ff] text-white font-bold hover:shadow-lg hover:shadow-[#0066ff]/30 transition-all active:scale-95 gap-2">
                    <Play className="size-5" />
                    Run Squad
                  </button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Iniciar Run</DialogTitle>
                  <DialogDescription>Descreva o que voce quer que o squad produza.</DialogDescription>
                </DialogHeader>
                <textarea
                  value={runInput}
                  onChange={(e) => setRunInput(e.target.value)}
                  placeholder="Ex: Escreva um artigo sobre inteligencia artificial..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-[#0066ff] focus:ring-4 focus:ring-[#0066ff]/10 outline-none resize-none text-sm"
                  rows={4}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleStartRun() }}
                />
                <DialogFooter>
                  <button
                    onClick={handleStartRun}
                    disabled={startingRun}
                    className="bg-[#0066ff] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#0066ff]/90 flex items-center gap-2 disabled:opacity-50"
                  >
                    {startingRun ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                    {startingRun ? 'Iniciando...' : 'Executar'}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs: Overview | Runs (sem Pipeline) */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-10">
            {[
              { key: 'overview' as const, label: 'Overview', Icon: Bot },
              { key: 'runs' as const, label: 'Runs', Icon: Clock },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#0066ff] text-[#0066ff]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.Icon className="size-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Active Agents */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold tracking-tight">Active Agents</h3>
              {squad.agents.length === 0 ? (
                <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center">
                  <p className="text-sm text-slate-400">No agents configured yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {squad.agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} isWorking={hasRunning} />
                  ))}
                </div>
              )}
            </div>

            {/* Active Pipeline */}
            <div className="space-y-6 mt-4">
              <h3 className="text-xl font-bold tracking-tight">Active Pipeline</h3>
              <PipelinePreview steps={squad.pipeline?.steps ?? []} latestRun={squad.runs[0] ?? null} />
            </div>

            {/* Recent Runs */}
            <div className="space-y-6 mt-4">
              <h3 className="text-xl font-bold tracking-tight">Recent Runs</h3>
              <RunsTable runs={squad.runs.slice(0, 5)} squadId={squad.id} />
            </div>
          </>
        )}

        {activeTab === 'runs' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold tracking-tight">All Runs</h3>
            <RunsTable runs={squad.runs} squadId={squad.id} />
          </div>
        )}
      </div>
    </>
  )
}

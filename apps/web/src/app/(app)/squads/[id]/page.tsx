'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Play,
  Bot,
  GitBranch,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Pause,
  AlertCircle,
  ArrowLeft,
  Zap,
  Hash,
  CircleDot,
  ShieldCheck,
  Coins,
  Trash2,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
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
import { AppHeader } from '@/components/layout/app-header'

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

interface RunCount {
  steps: number
}

interface Run {
  id: string
  status: string
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  totalTokens: number
  totalCost: number
  _count: RunCount
}

interface SquadDetail {
  id: string
  name: string
  description: string | null
  icon: string
  code: string
  version: number
  agents: Agent[]
  pipeline: Pipeline | null
  runs: Run[]
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

const STEP_TYPE_CONFIG: Record<string, { className: string }> = {
  inline: { className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  subagent: { className: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  checkpoint: { className: 'bg-amber/10 text-amber border-amber/20' },
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start) return '-'
  const startMs = new Date(start).getTime()
  const endMs = end ? new Date(end).getTime() : Date.now()
  const seconds = Math.floor((endMs - startMs) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainSec = seconds % 60
  return `${minutes}m ${remainSec}s`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OverviewTab({ squad }: { squad: SquadDetail }) {
  return (
    <div className="space-y-6">
      {/* Squad info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Squad Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd className="font-medium">{squad.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Code</dt>
              <dd className="font-mono text-xs text-amber">{squad.code}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Version</dt>
              <dd>v{squad.version}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Agents</dt>
              <dd>{squad.agents.length}</dd>
            </div>
          </dl>
          {squad.description && (
            <p className="mt-3 text-xs text-muted-foreground">{squad.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Agents */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Agents</h3>
        {squad.agents.length === 0 ? (
          <p className="text-xs text-muted-foreground">No agents configured yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {squad.agents.map((agent) => (
              <Card key={agent.id} size="sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber/10 text-base">
                      {agent.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-sm">{agent.name}</CardTitle>
                      <CardDescription className="line-clamp-1 text-xs">
                        {agent.role}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    {agent.skills.length} skill{agent.skills.length !== 1 ? 's' : ''}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PipelineTab({ pipeline, agents }: { pipeline: Pipeline | null; agents: Agent[] }) {
  if (!pipeline || pipeline.steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
        <GitBranch className="h-10 w-10 opacity-30" />
        <p className="text-sm">No pipeline steps configured.</p>
      </div>
    )
  }

  const agentMap = new Map(agents.map((a) => [a.id, a]))

  return (
    <div className="relative max-w-xl space-y-0">
      {pipeline.steps.map((step, idx) => {
        const agent = step.agentId ? agentMap.get(step.agentId) : null
        const typeConfig = (STEP_TYPE_CONFIG[step.type as keyof typeof STEP_TYPE_CONFIG] ?? STEP_TYPE_CONFIG.inline)!
        const isLast = idx === pipeline.steps.length - 1

        return (
          <div key={step.id} className="relative flex gap-4 pb-6">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[17px] top-9 bottom-0 w-px bg-border" />
            )}

            {/* Step number circle */}
            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs font-medium text-muted-foreground">
              {step.order + 1}
            </div>

            {/* Step content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{step.label}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] capitalize ${typeConfig.className}`}
                >
                  {step.type === 'checkpoint' && <ShieldCheck className="mr-0.5 h-2.5 w-2.5" />}
                  {step.type === 'subagent' && <CircleDot className="mr-0.5 h-2.5 w-2.5" />}
                  {step.type}
                </Badge>
              </div>
              {agent && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {agent.icon} {agent.name}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RunsTab({ runs, squadId }: { runs: Run[]; squadId: string }) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
        <Play className="h-10 w-10 opacity-30" />
        <p className="text-sm">No runs yet. Start your first run.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Started</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Duration</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Tokens</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Cost</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => {
            const config = (STATUS_CONFIG[run.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending)!
            const Icon = config.icon
            return (
              <tr
                key={run.id}
                className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
              >
                <td className="px-4 py-2.5">
                  <Link
                    href={`/squads/${squadId}/runs/${run.id}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.className}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {run.startedAt ? formatDate(run.startedAt) : formatDate(run.createdAt)}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {formatDuration(run.startedAt, run.completedAt)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                  {run.totalTokens.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                  ${run.totalCost.toFixed(4)}
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
        <AppHeader title="Loading..." />
        <DetailSkeleton />
      </>
    )
  }

  if (error || !squad) {
    return (
      <>
        <AppHeader
          title="Error"
          actions={
            <Button variant="ghost" size="sm" render={<Link href="/squads" />}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          }
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error ?? 'Squad not found'}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        title={`${squad.icon} ${squad.name}`}
        description={squad.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/squads" />}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleDelete} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
              <DialogTrigger render={
                <Button size="sm" className="bg-amber text-black hover:bg-amber/90">
                  <Play className="h-3.5 w-3.5" />
                  Run
                </Button>
              } />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Iniciar Run</DialogTitle>
                  <DialogDescription>
                    Descreva o que você quer que o squad produza.
                  </DialogDescription>
                </DialogHeader>
                <textarea
                  value={runInput}
                  onChange={(e) => setRunInput(e.target.value)}
                  placeholder="Ex: Escreva um artigo sobre inteligência artificial para iniciantes..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-amber focus:outline-none"
                  rows={4}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleStartRun()
                    }
                  }}
                />
                <DialogFooter>
                  <Button
                    size="sm"
                    className="bg-amber text-black hover:bg-amber/90"
                    onClick={handleStartRun}
                    disabled={startingRun}
                  >
                    {startingRun ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {startingRun ? 'Iniciando...' : 'Executar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <Bot className="mr-1 h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pipeline">
              <GitBranch className="mr-1 h-3.5 w-3.5" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="runs">
              <Play className="mr-1 h-3.5 w-3.5" />
              Runs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab squad={squad} />
          </TabsContent>

          <TabsContent value="pipeline">
            <PipelineTab pipeline={squad.pipeline} agents={squad.agents} />
          </TabsContent>

          <TabsContent value="runs">
            <RunsTab runs={squad.runs} squadId={squad.id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Pause,
  Clock,
  Play,
  Square,
  AlertCircle,
  Coins,
  Hash,
  Timer,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ArrowRightLeft,
  RotateCcw,
  Send,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { AppHeader } from '@/components/layout/app-header'
import { useWebSocket } from '@/hooks/use-websocket'
import { WS_EVENTS } from '@/lib/ws-events'
import type {
  StepStartPayload,
  StepOutputPayload,
  StepCompletePayload,
  StepErrorPayload,
  RunStatusPayload,
  RunCompletePayload,
  RunMetricsPayload,
  HandoffPayload,
  CheckpointRequestPayload,
} from '@/lib/ws-events'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RunAgent {
  id: string
  name: string
  icon: string | null
}

interface RunStepDetail {
  id: string
  label: string
  type: string
  order: number
}

interface RunStep {
  id: string
  status: string
  output: string | null
  tokensUsed: number
  cost: number
  startedAt: string | null
  completedAt: string | null
  step: RunStepDetail
  agent: RunAgent | null
  logs: RunLog[]
}

interface RunLog {
  id: string
  level: string
  message: string
  timestamp: string
}

interface RunSquad {
  id: string
  name: string
  code: string
  icon: string | null
}

interface RunDetail {
  id: string
  status: string
  input: string | null
  totalTokens: number
  totalCost: number
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  squad: RunSquad
  steps: RunStep[]
}

interface LiveStep {
  runStepId: string
  stepId: string
  agentName: string
  agentIcon: string
  label: string
  stepIndex: number
  totalSteps: number
  status: 'running' | 'completed' | 'failed'
  output: string
  tokensUsed: number
  cost: number
  durationMs: number
}

interface CheckpointRequest {
  runStepId: string
  stepLabel: string
  previousOutput: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
  completed: { icon: CheckCircle2, className: 'text-emerald-500', label: 'Concluído' },
  running: { icon: Loader2, className: 'text-amber animate-spin', label: 'Executando' },
  failed: { icon: XCircle, className: 'text-destructive', label: 'Falhou' },
  paused: { icon: Pause, className: 'text-amber', label: 'Pausado' },
  queued: { icon: Clock, className: 'text-muted-foreground', label: 'Na fila' },
  pending: { icon: Clock, className: 'text-muted-foreground', label: 'Pendente' },
  cancelled: { icon: XCircle, className: 'text-muted-foreground', label: 'Cancelado' },
  skipped: { icon: ChevronRight, className: 'text-muted-foreground', label: 'Pulado' },
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainSec = seconds % 60
  return `${minutes}m ${remainSec}s`
}

function formatElapsed(start: string | null, end: string | null): string {
  if (!start) return '-'
  const startMs = new Date(start).getTime()
  const endMs = end ? new Date(end).getTime() : Date.now()
  return formatDuration(endMs - startMs)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function RunSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Coins
  label: string
  value: string
  className?: string
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3 pt-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted ${className ?? ''}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StepTimeline({
  steps,
  liveSteps,
  expandedStep,
  onToggleStep,
}: {
  steps: RunStep[]
  liveSteps: Map<string, LiveStep>
  expandedStep: string | null
  onToggleStep: (id: string) => void
}) {
  return (
    <div className="relative space-y-0">
      {steps.map((step, idx) => {
        const live = liveSteps.get(step.id)
        const status = live?.status ?? step.status
        const config = (STATUS_CONFIG[status] ?? STATUS_CONFIG.pending)!
        const Icon = config.icon
        const isLast = idx === steps.length - 1
        const isExpanded = expandedStep === step.id
        const output = live?.output ?? step.output
        const hasOutput = output && output.length > 0

        return (
          <div key={step.id} className="relative flex gap-4 pb-4">
            {/* Vertical connector line */}
            {!isLast && (
              <div className="absolute left-[17px] top-9 bottom-0 w-px bg-border" />
            )}

            {/* Status icon */}
            <div
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card ${config.className}`}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <button
                onClick={() => hasOutput && onToggleStep(step.id)}
                className="flex w-full items-start justify-between text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {step.agent?.icon ?? '🤖'} {step.step.label}
                    </span>
                    {step.step.type === 'checkpoint' && (
                      <Badge variant="outline" className="text-[10px] bg-amber/10 text-amber border-amber/20">
                        <ShieldCheck className="mr-0.5 h-2.5 w-2.5" />
                        checkpoint
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {step.agent?.name ?? 'Agent'}
                    {(live?.tokensUsed ?? step.tokensUsed) > 0 && (
                      <span className="ml-2 tabular-nums">
                        · {(live?.tokensUsed ?? step.tokensUsed).toLocaleString()} tokens
                        · ${(live?.cost ?? step.cost).toFixed(4)}
                      </span>
                    )}
                  </p>
                </div>
                {hasOutput && (
                  <div className="ml-2 mt-0.5 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                )}
              </button>

              {/* Expanded output */}
              {isExpanded && hasOutput && (
                <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                    {output}
                  </pre>
                </div>
              )}

              {/* Live streaming indicator */}
              {status === 'running' && live && (
                <div className="mt-2 rounded-lg border border-amber/20 bg-amber/5 p-3">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                    {live.output || <span className="animate-pulse text-muted-foreground">Gerando...</span>}
                    <span className="animate-pulse text-amber">▊</span>
                  </pre>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CheckpointPanel({
  checkpoint,
  runId,
  onRespond,
}: {
  checkpoint: CheckpointRequest
  runId: string
  onRespond: (action: 'approve' | 'adjust' | 'redo', feedback?: string) => void
}) {
  const [feedback, setFeedback] = useState('')

  return (
    <Card className="border-amber/30 bg-amber/5">
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center gap-2 text-amber">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-sm font-medium">Checkpoint: {checkpoint.stepLabel}</span>
        </div>

        {checkpoint.previousOutput && (
          <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed">
              {checkpoint.previousOutput}
            </pre>
          </div>
        )}

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Feedback opcional..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-amber focus:outline-none"
          rows={2}
        />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => onRespond('approve', feedback || undefined)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRespond('redo', feedback || undefined)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Refazer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function HandoffBanner({ fromAgent, toAgent }: { fromAgent: string; toAgent: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
      <ArrowRightLeft className="h-3.5 w-3.5 text-amber" />
      Handoff: {fromAgent} → {toAgent}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RunViewPage({
  params,
}: {
  params: Promise<{ id: string; runId: string }>
}) {
  const { id: squadId, runId } = React.use(params)
  const [run, setRun] = useState<RunDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveSteps, setLiveSteps] = useState<Map<string, LiveStep>>(new Map())
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [liveStatus, setLiveStatus] = useState<string | null>(null)
  const [liveMetrics, setLiveMetrics] = useState<{ totalTokens: number; totalCost: number; elapsedMs: number } | null>(null)
  const [checkpoint, setCheckpoint] = useState<CheckpointRequest | null>(null)
  const [handoff, setHandoff] = useState<{ from: string; to: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { isConnected, subscribe, subscribeToRun, unsubscribeFromRun, sendCheckpointResponse } = useWebSocket()
  const subscribedRef = useRef(false)
  const pollRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Fetch run data
  const fetchRun = useCallback(async () => {
    try {
      const res = await fetch(`/api/runs/${runId}`)
      if (!res.ok) throw new Error('Falha ao carregar run')
      const json = (await res.json()) as { data: RunDetail }
      const data = json.data
      setRun(data)

      // Extrair mensagem de erro dos logs se o run falhou
      if (data.status === 'failed') {
        const errorLog = data.steps
          .flatMap((s) => s.logs)
          .find((l) => l.level === 'error')
        if (errorLog) {
          setErrorMessage(errorLog.message)
        }
        setLiveStatus('failed')
      }

      // Se cancelado/completado/falhou, limpar estado
      if (['completed', 'failed', 'cancelled'].includes(data.status)) {
        setCheckpoint(null)
        setHandoff(null)
        if (pollRef.current) clearTimeout(pollRef.current)
      }

      // Detectar checkpoint pendente via dados do DB (fallback para quando WS falha)
      if (data.status === 'running' && !checkpoint) {
        const pendingCheckpoint = data.steps.find(
          (s) => s.step.type === 'checkpoint' && s.status === 'running'
        )
        if (pendingCheckpoint) {
          // Buscar o output do step anterior para mostrar no checkpoint
          const stepIndex = data.steps.indexOf(pendingCheckpoint)
          const prevStep = stepIndex > 0 ? data.steps[stepIndex - 1] : null
          const prevOutput = prevStep?.output ?? ''

          setCheckpoint({
            runStepId: pendingCheckpoint.id,
            stepLabel: pendingCheckpoint.step.label,
            previousOutput: prevOutput,
          })
        }
      }

      return data.status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    }
  }, [runId, checkpoint])

  // Initial fetch + polling para runs que podem falhar rápido
  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      const status = await fetchRun()
      setLoading(false)

      // Polling se o run ainda está em andamento (pega falhas rápidas que o WS perde)
      if (status && !['completed', 'failed', 'cancelled'].includes(status)) {
        const poll = () => {
          if (cancelled) return
          pollRef.current = setTimeout(async () => {
            const newStatus = await fetchRun()
            if (newStatus && !['completed', 'failed', 'cancelled'].includes(newStatus)) {
              poll()
            }
          }, 2000)
        }
        poll()
      }
    }

    init()

    return () => {
      cancelled = true
      if (pollRef.current) clearTimeout(pollRef.current)
    }
  }, [fetchRun])

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!isConnected) return
    // Sempre re-subscribe quando conectar (reconexão, etc)
    subscribeToRun(runId)
    subscribedRef.current = true

    return () => {
      unsubscribeFromRun(runId)
      subscribedRef.current = false
    }
  }, [isConnected, runId, subscribeToRun, unsubscribeFromRun])

  // WS event handlers
  useEffect(() => {
    const unsubs: (() => void)[] = []

    unsubs.push(
      subscribe(WS_EVENTS.RUN_STATUS, (payload) => {
        const p = payload as RunStatusPayload
        if (p.runId === runId) setLiveStatus(p.status)
      }),
    )

    unsubs.push(
      subscribe(WS_EVENTS.STEP_START, (payload) => {
        const p = payload as StepStartPayload
        if (p.runId !== runId) return
        setLiveSteps((prev) => {
          const next = new Map(prev)
          next.set(p.runStepId, {
            runStepId: p.runStepId,
            stepId: p.stepId,
            agentName: p.agentName,
            agentIcon: p.agentIcon,
            label: p.label,
            stepIndex: p.stepIndex,
            totalSteps: p.totalSteps,
            status: 'running',
            output: '',
            tokensUsed: 0,
            cost: 0,
            durationMs: 0,
          })
          return next
        })
        // Auto-expand running step
        setExpandedStep(null)
      }),
    )

    unsubs.push(
      subscribe(WS_EVENTS.STEP_OUTPUT, (payload) => {
        const p = payload as StepOutputPayload
        if (p.runId !== runId) return
        setLiveSteps((prev) => {
          const next = new Map(prev)
          const step = next.get(p.runStepId)
          if (step) {
            next.set(p.runStepId, { ...step, output: step.output + p.chunk })
          }
          return next
        })
      }),
    )

    unsubs.push(
      subscribe(WS_EVENTS.STEP_COMPLETE, (payload) => {
        const p = payload as StepCompletePayload
        if (p.runId !== runId) return
        setLiveSteps((prev) => {
          const next = new Map(prev)
          const step = next.get(p.runStepId)
          if (step) {
            next.set(p.runStepId, {
              ...step,
              status: 'completed',
              output: p.output,
              tokensUsed: p.tokensUsed,
              cost: p.cost,
              durationMs: p.durationMs,
            })
          }
          return next
        })
      }),
    )

    unsubs.push(
      subscribe(WS_EVENTS.STEP_ERROR, (payload) => {
        const p = payload as StepErrorPayload
        if (p.runId !== runId) return
        setLiveSteps((prev) => {
          const next = new Map(prev)
          const step = next.get(p.runStepId)
          if (step) {
            next.set(p.runStepId, { ...step, status: 'failed', output: `Erro: ${p.error}` })
          }
          return next
        })
      }),
    )

    unsubs.push(
      subscribe(WS_EVENTS.RUN_METRICS, (payload) => {
        const p = payload as RunMetricsPayload
        if (p.runId === runId) {
          setLiveMetrics({ totalTokens: p.totalTokens, totalCost: p.totalCost, elapsedMs: p.elapsedMs })
        }
      }),
    )

    unsubs.push(
      subscribe(WS_EVENTS.RUN_COMPLETE, (payload) => {
        const p = payload as RunCompletePayload
        if (p.runId === runId) {
          setLiveStatus(p.status)
          setLiveMetrics({ totalTokens: p.totalTokens, totalCost: p.totalCost, elapsedMs: p.durationMs })
          setCheckpoint(null)
          setHandoff(null)
          if (p.status === 'failed' && p.finalOutput) {
            setErrorMessage(p.finalOutput)
          }
          // Parar polling
          if (pollRef.current) clearTimeout(pollRef.current)
        }
      }),
    )

    unsubs.push(
      subscribe(WS_EVENTS.HANDOFF_START, (payload) => {
        const p = payload as HandoffPayload
        if (p.runId === runId) {
          setHandoff({ from: `${p.fromAgent.icon} ${p.fromAgent.name}`, to: `${p.toAgent.icon} ${p.toAgent.name}` })
        }
      }),
    )

    unsubs.push(
      subscribe(WS_EVENTS.HANDOFF_END, (payload) => {
        const p = payload as { runId: string }
        if (p.runId === runId) setHandoff(null)
      }),
    )

    unsubs.push(
      subscribe(WS_EVENTS.CHECKPOINT_REQUEST, (payload) => {
        const p = payload as CheckpointRequestPayload
        if (p.runId === runId) {
          setCheckpoint({
            runStepId: p.runStepId,
            stepLabel: p.stepLabel,
            previousOutput: p.previousOutput,
          })
        }
      }),
    )

    return () => unsubs.forEach((fn) => fn())
  }, [subscribe, runId])

  // Handlers
  const handlePause = useCallback(async () => {
    await fetch(`/api/runs/${runId}/pause`, { method: 'POST' })
  }, [runId])

  const handleResume = useCallback(async () => {
    await fetch(`/api/runs/${runId}/resume`, { method: 'POST' })
  }, [runId])

  const handleCancel = useCallback(async () => {
    await fetch(`/api/runs/${runId}/cancel`, { method: 'POST' })
    setCheckpoint(null)
    setHandoff(null)
    setLiveStatus('cancelled')
  }, [runId])

  const handleCheckpointResponse = useCallback(
    async (action: 'approve' | 'adjust' | 'redo', feedback?: string) => {
      if (!checkpoint) return
      // Usar REST API em vez de WS (mais confiável)
      try {
        await fetch(`/api/runs/${runId}/checkpoint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            runStepId: checkpoint.runStepId,
            action,
            feedback,
          }),
        })
        setCheckpoint(null)
      } catch {
        // Fallback para WS
        sendCheckpointResponse(runId, checkpoint.runStepId, action, feedback)
        setCheckpoint(null)
      }
    },
    [runId, checkpoint, sendCheckpointResponse],
  )

  const handleToggleStep = useCallback((stepId: string) => {
    setExpandedStep((prev) => (prev === stepId ? null : stepId))
  }, [])

  // Derived state
  const currentStatus = liveStatus ?? run?.status ?? 'queued'
  const statusConfig = (STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.queued)!
  const StatusIcon = statusConfig.icon
  const isActive = currentStatus === 'running' || currentStatus === 'paused'
  const tokens = liveMetrics?.totalTokens ?? run?.totalTokens ?? 0
  const cost = liveMetrics?.totalCost ?? run?.totalCost ?? 0

  if (loading) {
    return (
      <>
        <AppHeader title="Carregando..." />
        <RunSkeleton />
      </>
    )
  }

  if (error || !run) {
    return (
      <>
        <AppHeader
          title="Erro"
          actions={
            <Button variant="ghost" size="sm" render={<Link href={`/squads/${squadId}`} />}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </Button>
          }
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error ?? 'Run não encontrado'}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        title={`${run.squad.icon ?? '🤖'} ${run.squad.name}`}
        description={`Run · ${formatDate(run.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href={`/squads/${squadId}`} />}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </Button>
            {currentStatus === 'running' && (
              <Button variant="outline" size="sm" onClick={handlePause}>
                <Pause className="h-3.5 w-3.5" />
                Pausar
              </Button>
            )}
            {currentStatus === 'paused' && (
              <Button size="sm" className="bg-amber text-black hover:bg-amber/90" onClick={handleResume}>
                <Play className="h-3.5 w-3.5" />
                Retomar
              </Button>
            )}
            {isActive && (
              <Button variant="destructive" size="sm" onClick={handleCancel}>
                <Square className="h-3.5 w-3.5" />
                Cancelar
              </Button>
            )}
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Status banner */}
        <div className={`flex items-center gap-2 ${statusConfig.className}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{statusConfig.label}</span>
          {isActive && !isConnected && (
            <Badge variant="outline" className="ml-2 text-[10px] text-destructive border-destructive/30">
              WS desconectado
            </Badge>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (currentStatus === 'failed' || currentStatus === 'cancelled') && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-destructive">Erro na execução</p>
              <p className="mt-1 text-xs text-destructive/80">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid gap-3 sm:grid-cols-4">
          <MetricCard
            icon={Hash}
            label="Steps"
            value={`${run.steps.filter((s) => s.status === 'completed' || liveSteps.get(s.id)?.status === 'completed').length} / ${run.steps.length}`}
          />
          <MetricCard
            icon={Timer}
            label="Duração"
            value={
              liveMetrics
                ? formatDuration(liveMetrics.elapsedMs)
                : formatElapsed(run.startedAt, run.completedAt)
            }
            className="text-amber"
          />
          <MetricCard
            icon={Hash}
            label="Tokens"
            value={tokens.toLocaleString()}
          />
          <MetricCard
            icon={Coins}
            label="Custo"
            value={`$${cost.toFixed(4)}`}
            className="text-emerald-500"
          />
        </div>

        <Separator />

        {/* Handoff banner */}
        {handoff && <HandoffBanner fromAgent={handoff.from} toAgent={handoff.to} />}

        {/* Checkpoint panel */}
        {checkpoint && (
          <CheckpointPanel
            checkpoint={checkpoint}
            runId={runId}
            onRespond={handleCheckpointResponse}
          />
        )}

        {/* Step timeline */}
        <div>
          <h3 className="mb-4 text-sm font-medium">Pipeline</h3>
          <StepTimeline
            steps={run.steps}
            liveSteps={liveSteps}
            expandedStep={expandedStep}
            onToggleStep={handleToggleStep}
          />
        </div>
      </div>
    </>
  )
}

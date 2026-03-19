'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Pause,
  Clock,
  Play,
  Square,
  AlertTriangle,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Bot,
  PenLine,
  Search,
  Send as SendIcon,
} from 'lucide-react'
import Markdown from 'react-markdown'
import { AppHeader } from '@/components/layout/app-header'
import { GlassPanel } from '@/components/shared/glass-panel'
import { Skeleton } from '@/components/ui/skeleton'
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

interface RunAgent { id: string; name: string; icon: string | null }

interface RunStepDetail { id: string; label: string; type: string; order: number }

interface RunStep {
  id: string; status: string; output: string | null; tokensUsed: number; cost: number
  startedAt: string | null; completedAt: string | null; step: RunStepDetail
  agent: RunAgent | null; logs: RunLog[]
}

interface RunLog { id: string; level: string; message: string; timestamp: string }

interface RunSquad { id: string; name: string; code: string; icon: string | null }

interface RunDetail {
  id: string; status: string; input: string | null; totalTokens: number; totalCost: number
  createdAt: string; startedAt: string | null; completedAt: string | null
  squad: RunSquad; steps: RunStep[]
}

interface LiveStep {
  runStepId: string; stepId: string; agentName: string; agentIcon: string
  label: string; stepIndex: number; totalSteps: number
  status: 'running' | 'completed' | 'failed'; output: string
  tokensUsed: number; cost: number; durationMs: number
}

interface CheckpointRequest { runStepId: string; stepLabel: string; previousOutput: string }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

function formatElapsed(start: string | null, end: string | null): string {
  if (!start) return '-'
  return formatDuration((end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime())
}

function formatTokens(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`
  return String(v)
}

// Step icon by type
const STEP_ICONS: Record<string, typeof Search> = {
  inline: PenLine, subagent: Search, checkpoint: ShieldCheck,
}

// Run status config
const RUN_STATUS: Record<string, { label: string; bg: string; text: string; dotColor: string; ping: boolean }> = {
  running: { label: 'Running', bg: 'bg-emerald-100', text: 'text-emerald-600', dotColor: 'bg-emerald-500', ping: true },
  completed: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-600', dotColor: 'bg-emerald-500', ping: false },
  failed: { label: 'FAILED', bg: 'bg-red-100', text: 'text-red-600', dotColor: 'bg-red-500', ping: false },
  paused: { label: 'Paused', bg: 'bg-amber-100', text: 'text-amber-600', dotColor: 'bg-amber-500', ping: false },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-500', dotColor: 'bg-slate-400', ping: false },
  queued: { label: 'Queued', bg: 'bg-slate-100', text: 'text-slate-500', dotColor: 'bg-slate-400', ping: false },
  pending: { label: 'Pending', bg: 'bg-slate-100', text: 'text-slate-500', dotColor: 'bg-slate-400', ping: false },
}

// ---------------------------------------------------------------------------
// Pipeline Visualizer (horizontal, fiel ao Stitch)
// ---------------------------------------------------------------------------

function PipelineVisualizer({ steps, liveSteps }: { steps: RunStep[]; liveSteps: Map<string, LiveStep> }) {
  // Pre-compute statuses
  const statuses = steps.map((s) => liveSteps.get(s.id)?.status ?? s.status)

  return (
    <div className="px-6 py-4 bg-white/50 border-b border-slate-200 overflow-x-auto shrink-0">
      <div className="flex items-center mx-auto" style={{ minWidth: `${steps.length * 140}px` }}>
        {steps.map((step, i) => {
          const status = statuses[i]!
          const nextStatus = i < steps.length - 1 ? statuses[i + 1] : null
          const isCompleted = status === 'completed'
          const isRunning = status === 'running'
          const isFailed = status === 'failed'
          const isPending = !isCompleted && !isRunning && !isFailed
          const isLast = i === steps.length - 1
          const StepIcon = STEP_ICONS[step.step.type] ?? PenLine

          // Linha entre steps: verde se ambos lados completed, parcial se current completed mas next nao
          const nextIsCompleted = nextStatus === 'completed'
          const nextIsRunning = nextStatus === 'running'

          return (
            <React.Fragment key={step.id}>
              <div className={`flex items-center gap-2 relative z-10 shrink-0 ${isPending ? 'opacity-50' : ''}`}>
                <div className={`size-10 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 ${
                  isCompleted ? 'bg-emerald-500 shadow-emerald-500/20'
                    : isRunning ? 'bg-[#0066ff] shadow-[#0066ff]/30 ring-4 ring-[#0066ff]/20'
                      : isFailed ? 'bg-red-500 shadow-red-500/30 ring-4 ring-red-100'
                        : 'bg-slate-200 text-slate-500 shadow-none'
                }`}>
                  {isCompleted ? <CheckCircle2 className="size-5" />
                    : isRunning ? <Loader2 className="size-5 animate-spin" />
                      : isFailed ? <XCircle className="size-5" />
                        : <StepIcon className="size-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{step.step.label}</p>
                  <p className={`text-[10px] font-semibold ${
                    isCompleted ? 'text-emerald-600' : isRunning ? 'text-[#0066ff]' : isFailed ? 'text-red-500' : 'text-slate-500'
                  }`}>
                    {isCompleted ? 'Completed' : isRunning ? 'Active Session' : isFailed ? 'Failed' : 'Pending'}
                  </p>
                </div>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-3 min-w-[24px] ${
                  isCompleted && nextIsCompleted ? 'bg-emerald-500'
                    : isCompleted && nextIsRunning ? 'bg-slate-200 overflow-hidden'
                      : isCompleted && !nextIsCompleted ? 'bg-slate-200 overflow-hidden'
                        : 'bg-slate-200'
                }`}>
                  {isCompleted && nextIsRunning && <div className="h-full bg-[#0066ff]/30 w-1/2" />}
                  {isCompleted && !nextIsCompleted && !nextIsRunning && <div className="h-full bg-emerald-500 w-1/2" />}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Terminal
// ---------------------------------------------------------------------------

function Terminal({
  steps,
  liveSteps,
  expandedStep,
  onToggleStep,
  currentStatus,
  squadName,
  humanInputRequest,
  reviewRejectRequest,
  onHumanInputSend,
  onReviewDecide,
}: {
  steps: RunStep[]
  liveSteps: Map<string, LiveStep>
  expandedStep: string | null
  onToggleStep: (id: string) => void
  currentStatus: string
  squadName: string
  humanInputRequest: { runStepId: string; agentName: string; output: string } | null
  reviewRejectRequest: { runStepId: string; agentName: string; output: string; reason: string } | null
  onHumanInputSend: (message: string) => void
  onReviewDecide: (action: 'approve' | 'redo', feedback?: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const userScrolledRef = useRef(false)
  const [showLogs, setShowLogs] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [reviewFeedback, setReviewFeedback] = useState('')
  const isFailed = currentStatus === 'failed'
  const isRunning = currentStatus === 'running'

  // Auto-scroll so quando usuario nao scrollou pra cima
  useEffect(() => {
    if (scrollRef.current && !userScrolledRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [liveSteps, steps])

  // Detectar se usuario scrollou pra cima
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
      userScrolledRef.current = !isAtBottom
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  const activeStep = steps.find((s) => (liveSteps.get(s.id)?.status ?? s.status) === 'running')

  // Collect all logs from all steps for the logs panel
  const allLogs = steps.flatMap((s) =>
    s.logs.map((l) => ({ ...l, stepLabel: s.step.label, agentName: s.agent?.name ?? 'System' })),
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return (
    <div className="flex-1 flex flex-col bg-[#0b121c] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161f2c] border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-red-500/80" />
            <div className="size-2.5 rounded-full bg-amber-500/80" />
            <div className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
            <Bot className="size-3.5" />
            <span>{showLogs ? 'execution_logs' : `live_stream:${activeStep?.step.label.toLowerCase().replace(/\s+/g, '_') ?? 'terminal'}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isRunning && !showLogs && (
            <span className="text-[10px] font-bold text-emerald-500/70 animate-pulse tracking-widest uppercase">Streaming</span>
          )}
          {isFailed && !showLogs && (
            <span className="text-[10px] font-bold text-red-500/70 tracking-widest uppercase">Error</span>
          )}
          <div className="h-4 w-px bg-slate-700" />
          {/* Toggle: Terminal / Logs */}
          <div className="flex items-center bg-slate-800 rounded-md p-0.5 gap-0.5">
            <button
              onClick={() => setShowLogs(false)}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                !showLogs ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Terminal
            </button>
            <button
              onClick={() => setShowLogs(true)}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                showLogs ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Logs
            </button>
          </div>
          <button
            className="text-slate-400 hover:text-white transition-colors"
            onClick={() => {
              const text = showLogs
                ? allLogs.map((l) => `[${l.level}] [${l.agentName}] ${l.message}`).join('\n')
                : steps.map((s) => liveSteps.get(s.id)?.output ?? s.output ?? '').join('\n\n')
              navigator.clipboard.writeText(text)
            }}
          >
            <Copy className="size-4" />
          </button>
        </div>
      </div>

      {/* Content: Terminal view or Logs view */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed terminal-scroll">
        {showLogs ? (
          /* ===== LOGS VIEW ===== */
          <div className="space-y-2">
            {allLogs.length === 0 ? (
              <p className="text-slate-600">No logs recorded yet.</p>
            ) : (
              allLogs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className={`text-[10px] font-bold uppercase w-12 shrink-0 ${
                    log.level === 'error' ? 'text-red-400'
                      : log.level === 'warn' ? 'text-amber-400'
                        : log.level === 'debug' ? 'text-slate-600'
                          : 'text-slate-500'
                  }`}>
                    [{log.level}]
                  </span>
                  <span className="text-[#0066ff] text-xs shrink-0">[{log.agentName}]</span>
                  <span className={`text-xs ${log.level === 'error' ? 'text-red-300' : 'text-slate-300'}`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ===== TERMINAL VIEW ===== */
          <div className="space-y-3">
            {steps.map((step, stepIdx) => {
              const live = liveSteps.get(step.id)
              const status = live?.status ?? step.status
              const output = live?.output ?? step.output
              const hasOutput = output && output.length > 0
              const isExpanded = expandedStep === step.id
              const isStepRunning = status === 'running'
              const isStepFailed = status === 'failed'
              const isStepCompleted = status === 'completed'
              const agentName = step.agent?.name ?? 'Agent'

              return (
                <div key={step.id} className="space-y-2">
                  {/* Initialization log */}
                  {(isStepRunning || isStepCompleted || isStepFailed) && (
                    <>
                      <div className="text-slate-500">
                        <span className="text-emerald-500">❯</span> Initializing agent &quot;{agentName}&quot; for step {stepIdx + 1}/{steps.length}...
                      </div>
                      {stepIdx > 0 && (
                        <div className="text-slate-500">
                          <span className="text-emerald-500">❯</span> Loading context from Step {stepIdx} ({steps[stepIdx - 1]?.step.label})...
                        </div>
                      )}
                    </>
                  )}

                  {/* Step header - clickable */}
                  <button
                    onClick={() => hasOutput && onToggleStep(step.id)}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    {isStepCompleted && <span className="text-emerald-500">✓</span>}
                    {isStepRunning && <span className="text-[#0066ff]">▶</span>}
                    {isStepFailed && <span className="text-red-400">✖</span>}
                    {status === 'pending' && <span className="text-slate-600">•</span>}
                    <span className={`font-bold ${
                      isStepRunning ? 'text-[#0066ff]' : isStepFailed ? 'text-red-400' : isStepCompleted ? 'text-emerald-400' : 'text-slate-600'
                    }`}>
                      [{agentName}]
                    </span>
                    <span className="text-slate-300">{step.step.label}</span>
                    {hasOutput && !isStepRunning && (
                      isExpanded ? <ChevronDown className="size-3 text-slate-600 ml-auto" /> : <ChevronRight className="size-3 text-slate-600 ml-auto" />
                    )}
                    {(step.tokensUsed > 0 || (live?.tokensUsed ?? 0) > 0) && (
                      <span className="text-slate-600 text-xs ml-2">{formatTokens(live?.tokensUsed ?? step.tokensUsed)} tokens</span>
                    )}
                  </button>

                  {/* Expanded output */}
                  {isExpanded && hasOutput && !isStepRunning && (
                    <div className="mt-1 p-4 bg-slate-900/50 rounded-lg border border-slate-800/50 text-slate-200 text-xs whitespace-pre-wrap">
                      {output}
                    </div>
                  )}

                  {/* Live streaming */}
                  {isStepRunning && live && (
                    <div className="mt-1 p-4 bg-slate-900/50 rounded-lg border border-slate-800/50 text-slate-200">
                      <div className="whitespace-pre-wrap text-xs">
                        {live.output || <span className="text-slate-600">Processing...</span>}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-slate-500 text-xs">Generating output</span>
                        <span className="w-2 h-4 bg-[#0066ff]/80" style={{ animation: 'blink 1s step-end infinite' }} />
                      </div>
                    </div>
                  )}

                  {/* Step logs (info/warn from RunLog) */}
                  {(isStepRunning || isStepCompleted || isStepFailed) && step.logs.filter((l) => l.level !== 'error').length > 0 && (
                    <div className="space-y-1 ml-4">
                      {step.logs.filter((l) => l.level !== 'error').map((log, i) => (
                        <div key={i} className={`text-xs ${log.level === 'warn' ? 'text-amber-400' : 'text-slate-500'}`}>
                          <span className="text-slate-600">[{log.level}]</span> {log.message}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Error */}
                  {isStepFailed && (
                    <div className="mt-1 flex items-center gap-2 text-red-400 font-bold text-xs">
                      <AlertTriangle className="size-3.5" />
                      <span>✖ Error: {step.logs.find((l) => l.level === 'error')?.message ?? 'Step failed'}</span>
                    </div>
                  )}

                  {/* Completion log */}
                  {isStepCompleted && (
                    <div className="text-slate-500 text-xs">
                      <span className="text-emerald-500">❯</span> Step &quot;{step.step.label}&quot; completed ({formatTokens(step.tokensUsed)} tokens, ${step.cost.toFixed(4)})
                    </div>
                  )}
                </div>
              )
            })}

            {/* Final cursor if running and no input needed */}
            {isRunning && !humanInputRequest && !reviewRejectRequest && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-emerald-500">❯</span>
                <span className="text-slate-400">listening for agent output...</span>
                <span className="w-2 h-4 bg-[#0066ff]/80" style={{ animation: 'blink 1s step-end infinite' }} />
              </div>
            )}

            {/* Human input - inline como proxima linha do terminal */}
            {humanInputRequest && (
              <div className="mt-3">
                <div className="text-amber-400 text-xs mb-2">
                  ⚡ {humanInputRequest.agentName} is waiting for your response
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-400">❯</span>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        onHumanInputSend(chatInput.trim())
                        setChatInput('')
                      }
                    }}
                    placeholder="type your response..."
                    autoFocus
                    className="flex-1 bg-transparent text-slate-200 font-mono text-sm placeholder:text-slate-600 outline-none caret-amber-400"
                  />
                  <button
                    onClick={() => { if (chatInput.trim()) { onHumanInputSend(chatInput.trim()); setChatInput('') } }}
                    disabled={!chatInput.trim()}
                    className="text-amber-400 hover:text-white disabled:text-slate-700 transition-colors"
                  >
                    <SendIcon className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Review reject - inline como proxima linha do terminal */}
            {reviewRejectRequest && (
              <div className="mt-3">
                <div className="text-red-400 text-xs mb-1">
                  ✖ Review rejected by {reviewRejectRequest.agentName}
                </div>
                <div className="text-slate-500 text-xs mb-3">{reviewRejectRequest.reason}</div>
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-slate-500">❯</span>
                  <input
                    type="text"
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="optional feedback..."
                    className="flex-1 bg-transparent text-slate-200 font-mono text-sm placeholder:text-slate-600 outline-none caret-red-400"
                  />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => { onReviewDecide('approve', reviewFeedback || undefined); setReviewFeedback('') }}
                    className="text-slate-500 hover:text-white text-xs font-mono transition-colors"
                  >
                    [approve]
                  </button>
                  <button
                    onClick={() => { onReviewDecide('redo', reviewFeedback || undefined); setReviewFeedback('') }}
                    className="text-[#0066ff] hover:text-white text-xs font-mono transition-colors"
                  >
                    [redo]
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent Profile Card (right sidebar)
// ---------------------------------------------------------------------------

function AgentProfileCard({ step, liveStep }: { step: RunStep; liveStep?: LiveStep }) {
  const agent = step.agent
  if (!agent) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="size-14 rounded-xl bg-[#0066ff]/10 flex items-center justify-center text-2xl relative overflow-hidden">
          {agent.icon || <Bot className="size-7 text-[#0066ff]" />}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0066ff]/20 to-transparent" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{agent.name}</h3>
          <p className="text-xs text-slate-500">Agent #{agent.id.slice(-6)}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Current Step</p>
          <p className="text-xs text-slate-700 leading-snug">{step.step.label} ({step.step.type})</p>
        </div>
        <div className="flex items-center justify-between px-3 py-2 bg-[#0066ff]/5 rounded-lg border border-[#0066ff]/10">
          <span className="text-xs font-semibold text-[#0066ff]">Tokens Used</span>
          <span className="text-xs font-bold text-[#0066ff]">{formatTokens(liveStep?.tokensUsed ?? step.tokensUsed)}</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Activity Log
// ---------------------------------------------------------------------------

function ActivityLog({ steps, liveSteps }: { steps: RunStep[]; liveSteps: Map<string, LiveStep> }) {
  const activities = steps.flatMap((s) => {
    const live = liveSteps.get(s.id)
    const status = live?.status ?? s.status
    return [{
      label: s.step.label,
      status,
      agent: s.agent?.name ?? 'Agent',
      time: s.startedAt ?? s.completedAt,
    }]
  }).reverse()

  return (
    <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-900">Pipeline Activity</h4>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activities.map((a, i) => (
          <div key={i} className="flex gap-3">
            <div className={`mt-1 size-2 rounded-full shrink-0 ${
              a.status === 'completed' ? 'bg-emerald-500'
                : a.status === 'running' ? 'bg-[#0066ff] animate-pulse'
                  : a.status === 'failed' ? 'bg-red-500'
                    : 'bg-slate-300'
            }`} />
            <div>
              <p className="text-xs font-medium text-slate-800 leading-tight">{a.agent}: {a.label}</p>
              <p className="text-[10px] text-slate-400">
                {a.status === 'running' ? 'In progress...' : a.status === 'completed' ? 'Done' : a.status === 'failed' ? 'Failed' : 'Pending'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Checkpoint Modal (full screen overlay)
// ---------------------------------------------------------------------------

function CheckpointModal({
  checkpoint,
  onRespond,
}: {
  checkpoint: CheckpointRequest
  onRespond: (action: 'approve' | 'adjust' | 'redo', feedback?: string) => void
}) {
  const [feedback, setFeedback] = useState('')

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-slate-200">
          <div className="size-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Checkpoint: {checkpoint.stepLabel}</h3>
            <p className="text-sm text-slate-500">Review the agent output before proceeding.</p>
          </div>
        </div>

        {/* Output (markdown-like formatting) */}
        <div className="flex-1 overflow-y-auto p-6">
          {checkpoint.previousOutput ? (
            <div className="prose prose-sm prose-slate max-w-none bg-slate-50 rounded-xl p-6 border border-slate-200 font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {checkpoint.previousOutput}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No output to review.</p>
          )}
        </div>

        {/* Feedback + Actions */}
        <div className="p-6 border-t border-slate-200 space-y-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional feedback for the agent..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#0066ff] focus:ring-4 focus:ring-[#0066ff]/10 outline-none resize-none text-sm"
          />
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onRespond('redo', feedback || undefined)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
            >
              <RotateCcw className="size-4" />
              Redo
            </button>
            <button
              onClick={() => onRespond('approve', feedback || undefined)}
              className="bg-[#0066ff] hover:bg-[#0066ff]/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#0066ff]/25 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="size-4" />
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error Banner (floating, fiel ao Stitch failed state)
// ---------------------------------------------------------------------------

function ErrorBannerFloating({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-xl border border-red-200/50 rounded-2xl p-4 shadow-2xl w-full max-w-lg z-50">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
          <AlertTriangle className="size-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900">Error Detected</h4>
          <p className="text-xs text-slate-500 line-clamp-2">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-red-500/25 transition-all flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="size-3.5" />
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Human Input Chat (agent asked a question)
// ---------------------------------------------------------------------------

function HumanInputChat({
  agentName,
  output,
  onSend,
}: {
  agentName: string
  output: string
  onSend: (message: string) => void
}) {
  const [message, setMessage] = useState('')

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 p-6 border-b border-slate-200">
          <div className="size-12 rounded-xl bg-[#0066ff]/10 flex items-center justify-center text-[#0066ff] shrink-0">
            <Bot className="size-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">{agentName} needs your input</h3>
            <p className="text-sm text-slate-500">The agent is waiting for your response to continue.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 prose prose-sm prose-slate max-w-none">
            <Markdown>{output}</Markdown>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) {
                  onSend(message.trim())
                  setMessage('')
                }
              }}
              placeholder="Type your response..."
              autoFocus
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#0066ff] focus:ring-4 focus:ring-[#0066ff]/10 outline-none text-sm"
            />
            <button
              onClick={() => {
                if (message.trim()) {
                  onSend(message.trim())
                  setMessage('')
                }
              }}
              disabled={!message.trim()}
              className="bg-[#0066ff] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0066ff]/90 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              <SendIcon className="size-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Review Reject Modal
// ---------------------------------------------------------------------------

function ReviewRejectModal({
  agentName,
  output,
  reason,
  onDecide,
}: {
  agentName: string
  output: string
  reason: string
  onDecide: (action: 'approve' | 'redo', feedback?: string) => void
}) {
  const [feedback, setFeedback] = useState('')

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 p-6 border-b border-slate-200">
          <div className="size-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="size-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Review Rejected by {agentName}</h3>
            <p className="text-sm text-red-500 font-medium">{reason}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 prose prose-sm prose-slate max-w-none">
            <Markdown>{output}</Markdown>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 space-y-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional: add your own feedback for the agent to consider when redoing..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#0066ff] focus:ring-4 focus:ring-[#0066ff]/10 outline-none resize-none text-sm"
          />
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onDecide('approve', feedback || undefined)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              Approve Anyway
            </button>
            <button
              onClick={() => onDecide('redo', feedback || undefined)}
              className="bg-[#0066ff] hover:bg-[#0066ff]/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#0066ff]/25 transition-all flex items-center gap-2"
            >
              <RotateCcw className="size-4" />
              Redo Step
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Outputs Section (apos conclusao da pipeline)
// ---------------------------------------------------------------------------

function OutputsSection({ steps }: { steps: RunStep[] }) {
  const completedSteps = steps.filter((s) => s.output && s.output.length > 0)

  if (completedSteps.length === 0) return null

  return (
    <div className="border-t border-slate-200 bg-white">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Pipeline Outputs</h3>
        <p className="text-xs text-slate-500">Final output from each completed step</p>
      </div>
      <div className="divide-y divide-slate-100">
        {completedSteps.map((step) => (
          <div key={step.id} className="px-6 py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="size-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{step.step.label}</p>
                <p className="text-[10px] text-slate-500">
                  {step.agent?.name ?? 'Agent'} · {formatTokens(step.tokensUsed)} tokens · ${step.cost.toFixed(4)}
                </p>
              </div>
            </div>
            {/* Output formatado com Markdown */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900 prose-code:bg-slate-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#0b121c] prose-pre:text-slate-200 prose-pre:rounded-lg prose-li:text-slate-700 prose-a:text-[#0066ff]">
              <Markdown>
                {step.output!}
              </Markdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RunViewPage({ params }: { params: Promise<{ id: string; runId: string }> }) {
  const { id: squadId, runId } = React.use(params)
  const [run, setRun] = useState<RunDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveSteps, setLiveSteps] = useState<Map<string, LiveStep>>(new Map())
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [liveStatus, setLiveStatus] = useState<string | null>(null)
  const [liveMetrics, setLiveMetrics] = useState<{ totalTokens: number; totalCost: number; elapsedMs: number } | null>(null)
  const [checkpoint, setCheckpoint] = useState<CheckpointRequest | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [humanInputRequest, setHumanInputRequest] = useState<{ runStepId: string; agentName: string; output: string } | null>(null)
  const [reviewRejectRequest, setReviewRejectRequest] = useState<{ runStepId: string; agentName: string; output: string; reason: string } | null>(null)

  const { isConnected, subscribe, subscribeToRun, unsubscribeFromRun, sendCheckpointResponse, sendHumanInputResponse, sendReviewRejectResponse } = useWebSocket()
  const subscribedRef = useRef(false)
  const pollRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Fetch run data
  const fetchRun = useCallback(async () => {
    try {
      const res = await fetch(`/api/runs/${runId}`)
      if (!res.ok) throw new Error('Failed to load run')
      const json = (await res.json()) as { data: RunDetail }
      const data = json.data
      setRun(data)

      if (data.status === 'failed') {
        const errLog = data.steps.flatMap((s) => s.logs).find((l) => l.level === 'error')
        if (errLog) setErrorMessage(errLog.message)
        setLiveStatus('failed')
      }

      if (['completed', 'failed', 'cancelled'].includes(data.status)) {
        setCheckpoint(null)
        if (pollRef.current) clearTimeout(pollRef.current)
      }

      if (data.status === 'running' && !checkpoint) {
        const pending = data.steps.find((s) => s.step.type === 'checkpoint' && s.status === 'running')
        if (pending) {
          const idx = data.steps.indexOf(pending)
          const prev = idx > 0 ? data.steps[idx - 1] : null
          setCheckpoint({ runStepId: pending.id, stepLabel: pending.step.label, previousOutput: prev?.output ?? '' })
        }
      }

      return data.status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [runId, checkpoint])

  // Initial fetch + polling
  useEffect(() => {
    let cancelled = false
    async function init() {
      setLoading(true)
      const status = await fetchRun()
      setLoading(false)
      if (status && !['completed', 'failed', 'cancelled'].includes(status)) {
        const poll = () => {
          if (cancelled) return
          pollRef.current = setTimeout(async () => {
            const s = await fetchRun()
            if (s && !['completed', 'failed', 'cancelled'].includes(s)) poll()
          }, 2000)
        }
        poll()
      }
    }
    init()
    return () => { cancelled = true; if (pollRef.current) clearTimeout(pollRef.current) }
  }, [fetchRun])

  // WebSocket subscription
  useEffect(() => {
    if (!isConnected) return
    subscribeToRun(runId)
    subscribedRef.current = true
    return () => { unsubscribeFromRun(runId); subscribedRef.current = false }
  }, [isConnected, runId, subscribeToRun, unsubscribeFromRun])

  // WS event handlers
  useEffect(() => {
    const unsubs: (() => void)[] = []

    unsubs.push(subscribe(WS_EVENTS.RUN_STATUS, (p) => {
      const payload = p as RunStatusPayload
      if (payload.runId === runId) setLiveStatus(payload.status)
    }))

    unsubs.push(subscribe(WS_EVENTS.STEP_START, (p) => {
      const payload = p as StepStartPayload
      if (payload.runId !== runId) return
      setLiveSteps((prev) => {
        const next = new Map(prev)
        next.set(payload.runStepId, {
          runStepId: payload.runStepId, stepId: payload.stepId, agentName: payload.agentName,
          agentIcon: payload.agentIcon, label: payload.label, stepIndex: payload.stepIndex,
          totalSteps: payload.totalSteps, status: 'running', output: '', tokensUsed: 0, cost: 0, durationMs: 0,
        })
        return next
      })
      setExpandedStep(null)
    }))

    unsubs.push(subscribe(WS_EVENTS.STEP_OUTPUT, (p) => {
      const payload = p as StepOutputPayload
      if (payload.runId !== runId) return
      setLiveSteps((prev) => {
        const next = new Map(prev)
        const s = next.get(payload.runStepId)
        if (s) next.set(payload.runStepId, { ...s, output: s.output + payload.chunk })
        return next
      })
    }))

    unsubs.push(subscribe(WS_EVENTS.STEP_COMPLETE, (p) => {
      const payload = p as StepCompletePayload
      if (payload.runId !== runId) return
      setLiveSteps((prev) => {
        const next = new Map(prev)
        const s = next.get(payload.runStepId)
        if (s) next.set(payload.runStepId, { ...s, status: 'completed', output: payload.output, tokensUsed: payload.tokensUsed, cost: payload.cost, durationMs: payload.durationMs })
        return next
      })
    }))

    unsubs.push(subscribe(WS_EVENTS.STEP_ERROR, (p) => {
      const payload = p as StepErrorPayload
      if (payload.runId !== runId) return
      setLiveSteps((prev) => {
        const next = new Map(prev)
        const s = next.get(payload.runStepId)
        if (s) next.set(payload.runStepId, { ...s, status: 'failed', output: `Error: ${payload.error}` })
        return next
      })
    }))

    unsubs.push(subscribe(WS_EVENTS.RUN_METRICS, (p) => {
      const payload = p as RunMetricsPayload
      if (payload.runId === runId) setLiveMetrics({ totalTokens: payload.totalTokens, totalCost: payload.totalCost, elapsedMs: payload.elapsedMs })
    }))

    unsubs.push(subscribe(WS_EVENTS.RUN_COMPLETE, (p) => {
      const payload = p as RunCompletePayload
      if (payload.runId === runId) {
        setLiveStatus(payload.status)
        setLiveMetrics({ totalTokens: payload.totalTokens, totalCost: payload.totalCost, elapsedMs: payload.durationMs })
        setCheckpoint(null)
        if (payload.status === 'failed' && payload.finalOutput) setErrorMessage(payload.finalOutput)
        if (pollRef.current) clearTimeout(pollRef.current)
      }
    }))

    unsubs.push(subscribe(WS_EVENTS.CHECKPOINT_REQUEST, (p) => {
      const payload = p as CheckpointRequestPayload
      if (payload.runId === runId) {
        setCheckpoint({ runStepId: payload.runStepId, stepLabel: payload.stepLabel, previousOutput: payload.previousOutput })
      }
    }))

    unsubs.push(subscribe(WS_EVENTS.HUMAN_INPUT_REQUEST, (p) => {
      const payload = p as { runId: string; runStepId: string; agentName: string; output: string }
      if (payload.runId === runId) {
        setHumanInputRequest({ runStepId: payload.runStepId, agentName: payload.agentName, output: payload.output })
      }
    }))

    unsubs.push(subscribe(WS_EVENTS.REVIEW_REJECT_REQUEST, (p) => {
      const payload = p as { runId: string; runStepId: string; agentName: string; output: string; reason: string }
      if (payload.runId === runId) {
        setReviewRejectRequest({ runStepId: payload.runStepId, agentName: payload.agentName, output: payload.output, reason: payload.reason })
      }
    }))

    return () => unsubs.forEach((fn) => fn())
  }, [subscribe, runId])

  // Handlers
  const handlePause = useCallback(async () => { await fetch(`/api/runs/${runId}/pause`, { method: 'POST' }) }, [runId])
  const handleResume = useCallback(async () => { await fetch(`/api/runs/${runId}/resume`, { method: 'POST' }) }, [runId])
  const handleCancel = useCallback(async () => {
    await fetch(`/api/runs/${runId}/cancel`, { method: 'POST' })
    setCheckpoint(null); setLiveStatus('cancelled')
  }, [runId])

  const handleCheckpointResponse = useCallback(async (action: 'approve' | 'adjust' | 'redo', feedback?: string) => {
    if (!checkpoint) return
    try {
      await fetch(`/api/runs/${runId}/checkpoint`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runStepId: checkpoint.runStepId, action, feedback }),
      })
      setCheckpoint(null)
    } catch {
      sendCheckpointResponse(runId, checkpoint.runStepId, action, feedback)
      setCheckpoint(null)
    }
  }, [runId, checkpoint, sendCheckpointResponse])

  const handleHumanInputSend = useCallback((message: string) => {
    if (!humanInputRequest) return
    sendHumanInputResponse(runId, humanInputRequest.runStepId, message)
    setHumanInputRequest(null)
  }, [runId, humanInputRequest, sendHumanInputResponse])

  const handleReviewRejectDecision = useCallback((action: 'approve' | 'redo', feedback?: string) => {
    if (!reviewRejectRequest) return
    sendReviewRejectResponse(runId, reviewRejectRequest.runStepId, action, feedback)
    setReviewRejectRequest(null)
  }, [runId, reviewRejectRequest, sendReviewRejectResponse])

  // Derived state
  const currentStatus = liveStatus ?? run?.status ?? 'queued'
  const statusConfig = RUN_STATUS[currentStatus] ?? RUN_STATUS.queued!
  const isActive = currentStatus === 'running' || currentStatus === 'paused'
  const isFailed = currentStatus === 'failed'
  const tokens = liveMetrics?.totalTokens ?? run?.totalTokens ?? 0
  const cost = liveMetrics?.totalCost ?? run?.totalCost ?? 0
  const elapsed = liveMetrics ? formatDuration(liveMetrics.elapsedMs) : formatElapsed(run?.startedAt ?? null, run?.completedAt ?? null)

  // Active step for right panel
  const activeRunStep = run?.steps.find((s) => {
    const live = liveSteps.get(s.id)
    return (live?.status ?? s.status) === 'running'
  }) ?? run?.steps.filter((s) => s.status === 'completed').pop()

  if (loading) {
    return (
      <>
        <AppHeader title="Run View" description="Loading" />
        <div className="p-8"><Skeleton className="h-96 rounded-xl" /></div>
      </>
    )
  }

  if (error || !run) {
    return (
      <>
        <AppHeader title="Run View" />
        <div className="p-8 max-w-4xl mx-auto">
          <GlassPanel accent className="p-8 text-center">
            <AlertTriangle className="size-8 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500">{error ?? 'Run not found'}</p>
          </GlassPanel>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Top bar with squad info + metrics + actions */}
      <AppHeader
        title={`${run.squad.icon ?? ''} ${run.squad.name}`}
        description={`Run #${run.id.slice(-8).toUpperCase()}`}
        actions={
          <div className="flex items-center gap-4">
            {/* Metrics pills */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <div className="px-3 py-1 flex flex-col items-center min-w-[70px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Elapsed</span>
                <span className="text-sm font-mono font-bold text-slate-700 leading-tight">{elapsed}</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="px-3 py-1 flex flex-col items-center min-w-[60px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Tokens</span>
                <span className="text-sm font-mono font-bold text-slate-700 leading-tight">{formatTokens(tokens)}</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="px-3 py-1 flex flex-col items-center min-w-[60px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Cost</span>
                <span className="text-sm font-mono font-bold text-slate-700 leading-tight">${cost.toFixed(2)}</span>
              </div>
            </div>

            {/* Status badge */}
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusConfig!.bg} ${statusConfig!.text}`}>
              {statusConfig!.ping && (
                <span className="relative flex size-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig!.dotColor} opacity-75`} />
                  <span className={`relative inline-flex rounded-full size-1.5 ${statusConfig!.dotColor}`} />
                </span>
              )}
              {statusConfig!.label}
            </span>

            {/* Action buttons */}
            {currentStatus === 'running' && (
              <button onClick={handlePause} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-slate-200">
                <Pause className="size-3.5" /> Pause
              </button>
            )}
            {currentStatus === 'paused' && (
              <button onClick={handleResume} className="bg-[#0066ff] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                <Play className="size-3.5" /> Resume
              </button>
            )}
            {isActive && (
              <button onClick={handleCancel} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-red-200 flex items-center gap-1">
                <Square className="size-3.5" /> Stop
              </button>
            )}

            <Link href={`/squads/${squadId}`} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
              Back
            </Link>
          </div>
        }
      />

      {/* Pipeline Visualizer */}
      <PipelineVisualizer steps={run.steps} liveSteps={liveSteps} />

      {/* Main content - scrollable, terminal keeps fixed height */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="flex p-6 gap-6" style={{ minHeight: '500px', height: 'calc(100vh - 180px)' }}>
          {/* Terminal */}
          <Terminal
            steps={run.steps}
            liveSteps={liveSteps}
            expandedStep={expandedStep}
            onToggleStep={(id) => setExpandedStep((prev) => prev === id ? null : id)}
            currentStatus={currentStatus}
            squadName={run.squad.name}
            humanInputRequest={humanInputRequest}
            reviewRejectRequest={reviewRejectRequest}
            onHumanInputSend={handleHumanInputSend}
            onReviewDecide={handleReviewRejectDecision}
          />

          {/* Right sidebar: Agent profile + Activity */}
          <div className="w-80 flex flex-col gap-6 shrink-0 hidden lg:flex">
            {activeRunStep && (
              <AgentProfileCard step={activeRunStep} liveStep={liveSteps.get(activeRunStep.id)} />
            )}
            <ActivityLog steps={run.steps} liveSteps={liveSteps} />
          </div>
        </div>

        {/* Outputs formatados - aparece apos pipeline concluir, pagina cresce */}
        {!isActive && run.steps.some((s) => s.output) && (
          <OutputsSection steps={run.steps} />
        )}

        {/* Checkpoint modal */}
        {/* Checkpoint modal */}
        {checkpoint && (
          <CheckpointModal checkpoint={checkpoint} onRespond={handleCheckpointResponse} />
        )}

        {/* Error floating banner */}
        {isFailed && errorMessage && !checkpoint && (
          <ErrorBannerFloating message={errorMessage} />
        )}
      </main>
    </>
  )
}

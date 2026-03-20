'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Square,
  AlertTriangle,
  Copy,
  Bot,
  SendIcon,
  Wand2,
  ArrowLeft,
} from 'lucide-react'
import Markdown from 'react-markdown'
import { AppHeader } from '@/components/layout/app-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebSocket } from '@/hooks/use-websocket'
import { WS_EVENTS } from '@/lib/ws-events'
import type { CheckpointRequestPayload } from '@/lib/ws-events'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ArchitectLog {
  type: 'progress' | 'output' | 'error' | 'user' | 'system'
  phase: string
  content: string
  timestamp: number
}

interface ArchitectCheckpoint {
  runStepId: string
  question: string
  type: 'approval' | 'selection' | 'input'
  options?: string[]
  previousOutput: string
}

interface ArchitectStatus {
  id: string
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'idle'
  phase: string
}

const PHASE_LABELS: Record<string, string> = {
  init: 'Inicializando',
  discovery: 'Descoberta',
  'best-practices': 'Boas Praticas',
  research: 'Pesquisa',
  extraction: 'Extracao',
  'skill-discovery': 'Skills',
  design: 'Design',
  approval: 'Aprovacao',
  build: 'Construindo',
  validate: 'Validacao',
  complete: 'Completo',
}

const PHASES_ORDER = [
  'discovery', 'best-practices', 'research', 'extraction',
  'skill-discovery', 'design', 'approval', 'build', 'validate',
]

// ---------------------------------------------------------------------------
// Phase Pipeline (horizontal, like RunView)
// ---------------------------------------------------------------------------

function PhasePipeline({ currentPhase, status }: { currentPhase: string; status: string }) {
  const currentIdx = PHASES_ORDER.indexOf(currentPhase)

  return (
    <div className="px-6 py-4 bg-white/50 border-b border-slate-200 overflow-x-auto shrink-0">
      <div className="flex items-center mx-auto" style={{ minWidth: `${PHASES_ORDER.length * 130}px` }}>
        {PHASES_ORDER.map((phase, i) => {
          const isCompleted = i < currentIdx || status === 'completed'
          const isRunning = i === currentIdx && status === 'running'
          const isFailed = i === currentIdx && status === 'failed'
          const isPending = i > currentIdx
          const isLast = i === PHASES_ORDER.length - 1

          return (
            <React.Fragment key={phase}>
              <div className={`flex items-center gap-2 relative z-10 shrink-0 ${isPending ? 'opacity-40' : ''}`}>
                <div className={`size-8 rounded-full flex items-center justify-center text-white shadow-md shrink-0 text-xs font-bold ${
                  isCompleted ? 'bg-emerald-500 shadow-emerald-500/20'
                    : isRunning ? 'bg-[#0066ff] shadow-[#0066ff]/30 ring-4 ring-[#0066ff]/20'
                      : isFailed ? 'bg-red-500 shadow-red-500/30'
                        : 'bg-slate-200 text-slate-500 shadow-none'
                }`}>
                  {isCompleted ? <CheckCircle2 className="size-4" />
                    : isRunning ? <Loader2 className="size-4 animate-spin" />
                      : isFailed ? <XCircle className="size-4" />
                        : <span>{i + 1}</span>}
                </div>
                <span className={`text-xs font-bold truncate max-w-[80px] ${
                  isCompleted ? 'text-emerald-600' : isRunning ? 'text-[#0066ff]' : isFailed ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {PHASE_LABELS[phase] ?? phase}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-2 min-w-[16px] ${
                  isCompleted ? 'bg-emerald-500' : isRunning ? 'bg-[#0066ff]/30' : 'bg-slate-200'
                }`} />
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

function ArchitectTerminal({
  logs,
  checkpoint,
  status,
  phase,
  onRespond,
}: {
  logs: ArchitectLog[]
  checkpoint: ArchitectCheckpoint | null
  status: string
  phase: string
  onRespond: (value: string, selected?: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const userScrolledRef = useRef(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set())

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && !userScrolledRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, checkpoint])

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

  const handleSend = (value: string, selected?: string) => {
    onRespond(value, selected)
    setInputValue('')
    setSelectedOptions(new Set())
  }

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
            <Wand2 className="size-3.5" />
            <span>architect:{phase}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status === 'running' && (
            <span className="text-[10px] font-bold text-emerald-500/70 animate-pulse tracking-widest uppercase">Active</span>
          )}
          {status === 'completed' && (
            <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Done
            </span>
          )}
          {status === 'failed' && (
            <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Failed</span>
          )}
          <button
            className="text-slate-400 hover:text-white transition-colors"
            onClick={() => {
              const text = logs.map((l) => l.content).join('\n\n')
              navigator.clipboard.writeText(text)
            }}
          >
            <Copy className="size-4" />
          </button>
        </div>
      </div>

      {/* Terminal content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed terminal-scroll">
        <div className="space-y-3">
          {/* Welcome */}
          <div className="text-[#0066ff] mb-2">
            <span className="text-slate-500">$</span> architect --mode create
          </div>
          <div className="text-slate-500 text-xs mb-6">
            Architect v1.0 — Squad creation assistant powered by AI
          </div>

          {/* Logs */}
          {logs.map((log, i) => (
            <div key={i}>
              {log.type === 'progress' && (
                <div className="text-slate-400">
                  <span className="text-emerald-500">{'>'}</span>{' '}
                  <span className="text-slate-600">[{PHASE_LABELS[log.phase] ?? log.phase}]</span>{' '}
                  {log.content}
                </div>
              )}
              {log.type === 'output' && (
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800/50 text-slate-200 text-xs">
                  <div className="prose prose-sm prose-invert max-w-none prose-headings:text-slate-200 prose-p:text-slate-300 prose-strong:text-white prose-code:text-emerald-400">
                    <Markdown>{log.content}</Markdown>
                  </div>
                </div>
              )}
              {log.type === 'error' && (
                <div className="text-red-400">
                  <span className="text-red-500">!</span> ERROR: {log.content}
                </div>
              )}
              {log.type === 'user' && (
                <div className="text-amber-400">
                  <span className="text-amber-500">{'>'}</span> {log.content}
                </div>
              )}
              {log.type === 'system' && (
                <div className="text-slate-500 text-xs">
                  {log.content}
                </div>
              )}
            </div>
          ))}

          {/* Checkpoint inline */}
          {checkpoint && (
            <div className="mt-4 space-y-3">
              <div className="text-[#0066ff] font-bold text-xs">
                {'>'} {checkpoint.question}
              </div>

              {/* Selection */}
              {checkpoint.type === 'selection' && checkpoint.options && (
                <div className="space-y-1 ml-4">
                  <p className="text-slate-600 text-[10px] mb-1">Clique para selecionar (multiplos permitidos)</p>
                  {checkpoint.options.map((opt, i) => {
                    const isSelected = selectedOptions.has(opt)
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedOptions((prev) => {
                            const next = new Set(prev)
                            if (next.has(opt)) next.delete(opt)
                            else next.add(opt)
                            return next
                          })
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                          isSelected
                            ? 'bg-[#0066ff]/20 text-[#0066ff] border border-[#0066ff]/40'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <span className={isSelected ? 'text-[#0066ff]' : 'text-slate-600'}>[{isSelected ? 'x' : ' '}]</span> {opt}
                      </button>
                    )
                  })}
                  {selectedOptions.size > 0 && (
                    <button
                      onClick={() => handleSend('', Array.from(selectedOptions).join(', '))}
                      className="mt-2 bg-[#0066ff] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0066ff]/80 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="size-3" /> Confirmar ({selectedOptions.size})
                    </button>
                  )}
                </div>
              )}

              {/* Input */}
              {(checkpoint.type === 'input' || (checkpoint.type === 'selection' && !checkpoint.options?.length)) && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">{'>'}</span>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputValue.trim()) {
                        handleSend(inputValue.trim())
                      }
                    }}
                    placeholder="digite sua resposta..."
                    autoFocus
                    className="flex-1 bg-transparent text-slate-200 font-mono text-sm placeholder:text-slate-600 outline-none caret-amber-400"
                  />
                  <button
                    onClick={() => inputValue.trim() && handleSend(inputValue.trim())}
                    disabled={!inputValue.trim()}
                    className="text-[#0066ff] hover:text-white disabled:text-slate-700 transition-colors"
                  >
                    <SendIcon className="size-4" />
                  </button>
                </div>
              )}

              {/* Approval */}
              {checkpoint.type === 'approval' && (
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{'>'}</span>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="feedback opcional..."
                      className="flex-1 bg-transparent text-slate-200 font-mono text-sm placeholder:text-slate-600 outline-none caret-amber-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSend(inputValue.trim() || '')}
                      className="text-emerald-400 hover:text-white text-xs font-mono transition-colors px-2 py-1 rounded hover:bg-emerald-500/20"
                    >
                      [approve]
                    </button>
                    <button
                      onClick={() => handleSend(inputValue.trim() || 'redo', 'redo')}
                      className="text-amber-400 hover:text-white text-xs font-mono transition-colors px-2 py-1 rounded hover:bg-amber-500/20"
                    >
                      [redo]
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cursor */}
          {status === 'running' && !checkpoint && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-emerald-500">{'>'}</span>
              <span className="w-2 h-4 bg-[#0066ff]/80" style={{ animation: 'blink 1s step-end infinite' }} />
            </div>
          )}

          {/* Completed */}
          {status === 'completed' && (
            <div className="mt-4 text-emerald-400 font-bold">
              {'>'} Squad criado com sucesso! Redirecionando...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function ArchitectSidebar({ phase, status, logs }: { phase: string; status: string; logs: ArchitectLog[] }) {
  const progressLogs = logs.filter((l) => l.type === 'progress')

  return (
    <div className="w-80 flex flex-col gap-6 shrink-0 hidden lg:flex">
      {/* Architect Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="size-14 rounded-xl bg-[#0066ff]/10 flex items-center justify-center text-[#0066ff] relative overflow-hidden">
            <Wand2 className="size-7" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0066ff]/20 to-transparent" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Architect</h3>
            <p className="text-xs text-slate-500">Squad Designer AI</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Current Phase</p>
            <p className="text-xs text-slate-700 leading-snug">{PHASE_LABELS[phase] ?? phase}</p>
          </div>
          <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
            status === 'running' ? 'bg-[#0066ff]/5 border-[#0066ff]/10' :
            status === 'completed' ? 'bg-emerald-50 border-emerald-100' :
            status === 'failed' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
          }`}>
            <span className={`text-xs font-semibold ${
              status === 'running' ? 'text-[#0066ff]' :
              status === 'completed' ? 'text-emerald-600' :
              status === 'failed' ? 'text-red-600' : 'text-slate-500'
            }`}>Status</span>
            <span className={`text-xs font-bold ${
              status === 'running' ? 'text-[#0066ff]' :
              status === 'completed' ? 'text-emerald-600' :
              status === 'failed' ? 'text-red-600' : 'text-slate-500'
            }`}>{status === 'running' ? 'Active' : status}</span>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-900">Activity</h4>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {progressLogs.map((log, i) => (
            <div key={i} className="flex gap-3">
              <div className={`mt-1 size-2 rounded-full shrink-0 ${
                i === progressLogs.length - 1 && status === 'running' ? 'bg-[#0066ff] animate-pulse' : 'bg-emerald-500'
              }`} />
              <div>
                <p className="text-xs font-medium text-slate-800 leading-tight">
                  {PHASE_LABELS[log.phase] ?? log.phase}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-2">{log.content}</p>
              </div>
            </div>
          ))}
          {progressLogs.length === 0 && (
            <p className="text-xs text-slate-400">Waiting for architect to start...</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ArchitectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const squadName = searchParams.get('name') ?? ''
  const squadIcon = searchParams.get('icon') ?? 'rocket'
  const squadColor = searchParams.get('color') ?? '#0066ff'
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('idle')
  const [phase, setPhase] = useState('init')
  const [logs, setLogs] = useState<ArchitectLog[]>([])
  const [checkpoint, setCheckpoint] = useState<ArchitectCheckpoint | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { isConnected, subscribe, subscribeToRun, unsubscribeFromRun } = useWebSocket()
  const subscribedRef = useRef(false)
  const initRef = useRef(false)

  // Start architect session on mount (guard against StrictMode double-mount)
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    async function init() {
      try {
        const res = await fetch('/api/squads/architect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'create',
            squadName: squadName || undefined,
            squadIcon: squadIcon ? JSON.stringify({ icon: squadIcon, color: squadColor }) : undefined,
          }),
        })

        if (!res.ok) throw new Error('Falha ao iniciar o Architect')
        const json = (await res.json()) as { data: { sessionId: string } }

        setSessionId(json.data.sessionId)
        setStatus('running')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao iniciar')
      }
    }

    init()
  }, [])

  // Polling — check session status + pending questions every 2s
  useEffect(() => {
    if (!sessionId || status === 'completed' || status === 'failed') return

    const poll = async () => {
      try {
        const res = await fetch(`/api/squads/architect?sessionId=${sessionId}`)
        if (!res.ok) return
        const json = (await res.json()) as {
          data: ArchitectStatus & {
            pendingQuestion?: {
              phase: string
              question: string
              options?: string[]
              type: 'approval' | 'selection' | 'input'
              runStepId: string
              context?: string
            } | null
          }
        }
        const data = json.data
        if (data.phase && data.phase !== phase) {
          setPhase(data.phase)
          // Add progress log if phase changed
          setLogs((prev) => {
            const lastProgress = [...prev].reverse().find((l) => l.type === 'progress')
            if (lastProgress?.phase === data.phase) return prev
            return [...prev, {
              type: 'progress' as const,
              phase: data.phase,
              content: `Fase: ${PHASE_LABELS[data.phase] ?? data.phase}`,
              timestamp: Date.now(),
            }]
          })
        }
        if (data.status === 'completed') {
          setStatus('completed')
          // Buscar squadId e redirecionar
          const squadRes = await fetch(`/api/squads?limit=1&page=1`)
          if (squadRes.ok) {
            const squadJson = (await squadRes.json()) as { data: { id: string }[] }
            if (squadJson.data?.[0]?.id) {
              setTimeout(() => router.push(`/squads/${squadJson.data[0]!.id}`), 1500)
            }
          }
        }
        if (data.status === 'failed') {
          setStatus('failed')
        }

        // Process pending question via polling (fallback for WS)
        if (data.pendingQuestion && !checkpoint) {
          // Show context as output log if present
          if (data.pendingQuestion.context) {
            setLogs((prev) => {
              const hasContext = prev.some((l) => l.type === 'output' && l.phase === data.pendingQuestion!.phase)
              if (hasContext) return prev
              return [...prev, { type: 'output' as const, phase: data.pendingQuestion!.phase, content: data.pendingQuestion!.context!, timestamp: Date.now() }]
            })
          }
          setCheckpoint({
            runStepId: data.pendingQuestion.runStepId,
            question: data.pendingQuestion.question,
            type: data.pendingQuestion.type,
            options: data.pendingQuestion.options,
            previousOutput: data.pendingQuestion.context ?? '',
          })
        }
      } catch { /* ignore */ }
    }

    const interval = setInterval(poll, 2000)
    // Also poll immediately
    poll()
    return () => clearInterval(interval)
  }, [sessionId, status, phase, checkpoint])

  // WebSocket subscription
  useEffect(() => {
    if (!isConnected || !sessionId) return
    subscribeToRun(sessionId)
    subscribedRef.current = true
    return () => { unsubscribeFromRun(sessionId); subscribedRef.current = false }
  }, [isConnected, sessionId, subscribeToRun, unsubscribeFromRun])

  // WS event handlers
  useEffect(() => {
    const unsubs: (() => void)[] = []

    unsubs.push(subscribe('architect:progress', (p) => {
      const payload = p as { sessionId: string; phase: string; message: string }
      if (sessionId && payload.sessionId !== sessionId) return
      setPhase(payload.phase)
      setStatus('running')
      setLogs((prev) => [...prev, {
        type: 'progress',
        phase: payload.phase,
        content: payload.message,
        timestamp: Date.now(),
      }])
    }))

    unsubs.push(subscribe('architect:output', (p) => {
      const payload = p as { sessionId: string; phase: string; chunk: string }
      if (sessionId && payload.sessionId !== sessionId) return
      setLogs((prev) => {
        const last = prev[prev.length - 1]
        if (last?.type === 'output' && last.phase === payload.phase) {
          return [...prev.slice(0, -1), { ...last, content: last.content + payload.chunk }]
        }
        return [...prev, { type: 'output', phase: payload.phase, content: payload.chunk, timestamp: Date.now() }]
      })
    }))

    unsubs.push(subscribe('architect:error', (p) => {
      const payload = p as { sessionId: string; error: string }
      if (sessionId && payload.sessionId !== sessionId) return
      setStatus('failed')
      setError(payload.error)
      setLogs((prev) => [...prev, { type: 'error', phase: 'error', content: payload.error, timestamp: Date.now() }])
    }))

    unsubs.push(subscribe('architect:complete', (p) => {
      const payload = p as { sessionId: string; squadId: string }
      if (sessionId && payload.sessionId !== sessionId) return
      setStatus('completed')
      setLogs((prev) => [...prev, { type: 'system', phase: 'complete', content: 'Squad criado com sucesso!', timestamp: Date.now() }])
      setTimeout(() => router.push(`/squads/${payload.squadId}`), 2000)
    }))

    unsubs.push(subscribe(WS_EVENTS.CHECKPOINT_REQUEST, (p) => {
      const payload = p as CheckpointRequestPayload
      if (sessionId && payload.runId !== sessionId) return
      setCheckpoint({
        runStepId: payload.runStepId,
        question: payload.question ?? payload.stepLabel,
        type: payload.checkpointType ?? 'input',
        options: payload.options,
        previousOutput: payload.previousOutput,
      })
    }))

    return () => unsubs.forEach((fn) => fn())
  }, [subscribe, sessionId, router])

  // Respond to checkpoint
  const handleRespond = useCallback(async (value: string, selected?: string) => {
    if (!checkpoint || !sessionId) return

    setLogs((prev) => [...prev, {
      type: 'user',
      phase,
      content: selected ?? value,
      timestamp: Date.now(),
    }])

    try {
      await fetch('/api/squads/architect', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          runStepId: checkpoint.runStepId,
          action: 'approve',
          feedback: value || undefined,
          selected: selected || undefined,
        }),
      })
    } catch { /* fallback handled by WS */ }

    setCheckpoint(null)
  }, [checkpoint, sessionId, phase])

  // Cancel
  const handleCancel = useCallback(() => {
    if (sessionId) {
      fetch(`/api/squads/architect?sessionId=${sessionId}`, { method: 'DELETE' }).catch(() => {})
    }
    router.push('/squads/new')
  }, [sessionId, router])

  if (error && !sessionId) {
    return (
      <>
        <AppHeader title="Architect" description="Error" />
        <div className="p-8 max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertTriangle className="size-8 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-700">{error}</p>
            <Link href="/squads/new" className="text-sm text-[#0066ff] font-bold mt-4 inline-block">Voltar</Link>
          </div>
        </div>
      </>
    )
  }

  if (!sessionId) {
    return (
      <>
        <AppHeader title="Architect" description="Starting..." />
        <div className="p-8"><Skeleton className="h-96 rounded-xl" /></div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        title="Architect"
        description="Designing your squad with AI"
        actions={
          <div className="flex items-center gap-3">
            {/* Phase badge */}
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              status === 'running' ? 'bg-emerald-100 text-emerald-600'
                : status === 'completed' ? 'bg-emerald-100 text-emerald-600'
                  : status === 'failed' ? 'bg-red-100 text-red-600'
                    : 'bg-slate-100 text-slate-500'
            }`}>
              {status === 'running' && (
                <span className="relative flex size-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
                </span>
              )}
              {status === 'running' ? PHASE_LABELS[phase] ?? phase : status}
            </span>

            {/* Cancel */}
            {status === 'running' && (
              <button
                onClick={handleCancel}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-red-200 flex items-center gap-1"
              >
                <Square className="size-3.5" /> Cancel
              </button>
            )}

            <Link
              href="/squads/new"
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold flex items-center gap-1"
            >
              <ArrowLeft className="size-3.5" /> Back
            </Link>
          </div>
        }
      />

      {/* Phase Pipeline */}
      <PhasePipeline currentPhase={phase} status={status} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="flex p-6 gap-6" style={{ minHeight: '500px', height: 'calc(100vh - 180px)' }}>
          {/* Terminal */}
          <ArchitectTerminal
            logs={logs}
            checkpoint={checkpoint}
            status={status}
            phase={phase}
            onRespond={handleRespond}
          />

          {/* Sidebar */}
          <ArchitectSidebar phase={phase} status={status} logs={logs} />
        </div>
      </main>
    </>
  )
}

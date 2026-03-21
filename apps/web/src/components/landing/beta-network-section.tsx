'use client'

import { useState, useEffect, useRef } from 'react'
import { GlassCard } from './glass-card'

// ---------------------------------------------------------------------------
// Agent node data
// ---------------------------------------------------------------------------

interface AgentNode {
  id: string
  name: string
  role: string
  x: number
  y: number
  color: string
  pulseDelay: number
}

const AGENTS: AgentNode[] = [
  { id: 'orchestrator', name: 'Orchestrator', role: 'Core', x: 50, y: 50, color: '#0066ff', pulseDelay: 0 },
  { id: 'researcher', name: 'Researcher', role: 'Analysis', x: 20, y: 25, color: '#6366f1', pulseDelay: 0.5 },
  { id: 'writer', name: 'Writer', role: 'Content', x: 80, y: 25, color: '#8b5cf6', pulseDelay: 1 },
  { id: 'reviewer', name: 'Reviewer', role: 'QA', x: 15, y: 75, color: '#06b6d4', pulseDelay: 1.5 },
  { id: 'deployer', name: 'Deployer', role: 'Ops', x: 85, y: 75, color: '#10b981', pulseDelay: 2 },
  { id: 'analyst', name: 'Analyst', role: 'Data', x: 50, y: 15, color: '#f59e0b', pulseDelay: 0.8 },
  { id: 'architect', name: 'Architect', role: 'Design', x: 50, y: 85, color: '#ec4899', pulseDelay: 1.2 },
]

const CONNECTIONS: [string, string][] = [
  ['orchestrator', 'researcher'],
  ['orchestrator', 'writer'],
  ['orchestrator', 'reviewer'],
  ['orchestrator', 'deployer'],
  ['orchestrator', 'analyst'],
  ['orchestrator', 'architect'],
  ['researcher', 'analyst'],
  ['writer', 'reviewer'],
  ['reviewer', 'architect'],
  ['deployer', 'architect'],
]

// ---------------------------------------------------------------------------
// Animated connection line (SVG)
// ---------------------------------------------------------------------------

function ConnectionLine({ from, to, delay }: { from: AgentNode; to: AgentNode; delay: number }) {
  return (
    <line
      x1={`${from.x}%`} y1={`${from.y}%`}
      x2={`${to.x}%`} y2={`${to.y}%`}
      stroke="url(#line-gradient)"
      strokeWidth="1"
      opacity="0.3"
      className="animate-pulse"
      style={{ animationDelay: `${delay}s`, animationDuration: '3s' }}
    />
  )
}

// ---------------------------------------------------------------------------
// Floating agent node
// ---------------------------------------------------------------------------

function AgentNodeEl({ agent, active }: { agent: AgentNode; active: boolean }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 group"
      style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
    >
      {/* Pulse ring */}
      {active && (
        <div
          className="absolute inset-0 -m-3 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: agent.color, animationDuration: '2s', animationDelay: `${agent.pulseDelay}s` }}
        />
      )}
      {/* Glow */}
      <div
        className="absolute inset-0 -m-4 rounded-full blur-xl opacity-30 transition-opacity duration-500"
        style={{ backgroundColor: agent.color, opacity: active ? 0.4 : 0.1 }}
      />
      {/* Node */}
      <div
        className="relative size-10 md:size-12 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg transition-all duration-500 cursor-default"
        style={{
          backgroundColor: agent.color,
          boxShadow: active ? `0 0 30px ${agent.color}60` : 'none',
          transform: active ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        {agent.name[0]}
      </div>
      {/* Label */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{agent.name}</p>
        <p className="text-[9px] text-slate-400 font-bold">{agent.role}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Live metrics ticker
// ---------------------------------------------------------------------------

function MetricsTicker() {
  const [tokens, setTokens] = useState(124832)
  const [messages, setMessages] = useState(47)

  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prev) => prev + Math.floor(Math.random() * 500) + 100)
      setMessages((prev) => prev + (Math.random() > 0.6 ? 1 : 0))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-6 text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-500">TOKENS:</span>
        <span className="text-slate-900 font-bold tabular-nums">{tokens.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-[#0066ff] animate-pulse" />
        <span className="text-slate-500">MESSAGES:</span>
        <span className="text-slate-900 font-bold tabular-nums">{messages}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-slate-500">AGENTS:</span>
        <span className="text-slate-900 font-bold">{AGENTS.length}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function BetaNetworkSection() {
  const [visible, setVisible] = useState(false)
  const [activeAgent, setActiveAgent] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Check if beta features are enabled
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.data?.preferences?.betaFeatures) {
          setVisible(true)
        }
      })
      .catch(() => {})
  }, [])

  // Cycle through active agents
  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % AGENTS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  const getNode = (id: string) => AGENTS.find((a) => a.id === id)!

  return (
    <section ref={sectionRef} className="py-24 px-6 lg:px-20 max-w-7xl mx-auto">
      {/* Beta badge */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/50 bg-amber-50/80 backdrop-blur-sm text-amber-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          Beta Feature Preview
        </div>
        <h2 className="text-slate-900 text-5xl md:text-6xl font-black leading-tight tracking-tighter mb-4">
          Live Agent{' '}
          <span className="italic bg-gradient-to-r from-[#0066ff] to-purple-500 bg-clip-text text-transparent">
            Neural Network
          </span>
        </h2>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
          Real-time visualization of agent communication topology.
          Watch autonomous agents coordinate, delegate, and synchronize.
        </p>
      </div>

      <GlassCard rounded="3xl" hover={false} className="p-8 md:p-12 border-white/50 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#0066ff]/5 rounded-full blur-[80px]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Network Topology</span>
          </div>
          <MetricsTicker />
        </div>

        {/* Network visualization */}
        <div className="relative aspect-[2/1] min-h-[300px] md:min-h-[400px] z-10">
          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0066ff" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0066ff" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {CONNECTIONS.map(([fromId, toId], i) => {
              const from = getNode(fromId)
              const to = getNode(toId)
              return <ConnectionLine key={`${fromId}-${toId}`} from={from} to={to} delay={i * 0.3} />
            })}
          </svg>

          {/* Agent nodes */}
          {AGENTS.map((agent, i) => (
            <AgentNodeEl key={agent.id} agent={agent} active={i === activeAgent} />
          ))}
        </div>

        {/* Bottom live feed */}
        <div className="mt-8 p-4 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-slate-800 relative z-10">
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-emerald-500 font-bold shrink-0">❯</span>
            <span className="text-slate-500 shrink-0">[network]</span>
            <span className="text-slate-300 truncate">
              Agent <span className="text-[#0066ff] font-bold">{AGENTS[activeAgent]!.name}</span>
              {' '}broadcasting context vectors to{' '}
              <span className="text-purple-400 font-bold">
                {CONNECTIONS.filter(([a, b]) => a === AGENTS[activeAgent]!.id || b === AGENTS[activeAgent]!.id).length}
              </span>
              {' '}connected nodes...
            </span>
            <span className="w-2 h-4 bg-[#0066ff]/80 shrink-0" style={{ animation: 'blink 1s step-end infinite' }} />
          </div>
        </div>
      </GlassCard>
    </section>
  )
}

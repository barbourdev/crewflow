'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  TerminalBlock,
  TerminalHighlight,
  TerminalCursor,
} from '@/components/shared/terminal-block'

// ---------------------------------------------------------------------------
// Typewriter hook
// ---------------------------------------------------------------------------

function useTypewriter(text: string, speed = 80, startDelay = 0) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    let i = 0

    const start = () => {
      const type = () => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1))
          i++
          timeout = setTimeout(type, speed)
        } else {
          setDone(true)
        }
      }
      type()
    }

    timeout = setTimeout(start, startDelay)
    return () => clearTimeout(timeout)
  }, [text, speed, startDelay])

  return { displayed, done }
}

// ---------------------------------------------------------------------------
// Ping dot
// ---------------------------------------------------------------------------

function PingDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066ff] opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066ff]" />
    </span>
  )
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

/** Callback para notificar quando a animacao do hero terminou */
interface HeroSectionProps {
  onIntroComplete?: () => void
}

export function HeroSection({ onIntroComplete }: HeroSectionProps) {
  // Linha 1: "SQUAD" digita primeiro
  const line1 = useTypewriter('SQUAD', 100, 300)
  // Linha 2: "SYNCHRONY" comeca quando line1 terminar
  const line2 = useTypewriter('SYNCHRONY', 80, line1.done ? 0 : 99999)

  const [showContent, setShowContent] = useState(false)

  // Quando line2 terminar, revelar o restante
  useEffect(() => {
    if (line2.done) {
      const t = setTimeout(() => {
        setShowContent(true)
        onIntroComplete?.()
      }, 400)
      return () => clearTimeout(t)
    }
  }, [line2.done, onIntroComplete])

  return (
    <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0066ff]/20 bg-white/40 backdrop-blur-[20px] text-[#0066ff] text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm transition-all duration-700 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <PingDot />
          The Antigravity Update is Here
        </div>

        {/* Title - Typewriter */}
        <h1
          className="text-slate-900 text-7xl md:text-9xl lg:text-[11rem] font-black leading-[0.8] tracking-tighter mb-12 min-h-[0.8em]"
          style={{ textShadow: '0 0 20px rgba(0, 102, 255, 0.3)' }}
        >
          <span className="block">
            {line1.displayed}
            {!line1.done && <span className="animate-pulse text-[#0066ff]">|</span>}
          </span>
          <span className="block bg-gradient-to-r from-[#0066ff] to-[#0066ff]/70 bg-clip-text text-transparent">
            {line2.displayed}
            {line1.done && !line2.done && <span className="animate-pulse text-[#0066ff]">|</span>}
          </span>
        </h1>

        {/* Subtitle - aparece apos typewriter */}
        <div
          className={`max-w-2xl mx-auto mb-16 transition-all duration-700 delay-100 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-slate-600 text-xl md:text-2xl font-medium leading-relaxed italic">
            The world&apos;s first cinematic orchestration layer for autonomous
            agent squads. Build, deploy, and watch them think.
          </p>
        </div>

        {/* CTA Buttons - aparece com delay */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-6 mb-24 transition-all duration-700 delay-300 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto min-w-[240px] rounded-2xl h-16 px-8 bg-[#0066ff] text-white text-lg font-black tracking-tight shadow-[0_10px_40px_-10px_rgba(0,102,255,0.5)] transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            Initialize Orchestrator
          </Link>
          <Link
            href="#"
            className="w-full sm:w-auto min-w-[240px] rounded-2xl h-16 px-8 bg-white/40 backdrop-blur-[20px] border border-white text-slate-900 text-lg font-bold tracking-tight transition-all hover:bg-white/80 flex items-center justify-center"
          >
            Read the Manifesto
          </Link>
        </div>

        {/* Terminal - aparece por ultimo */}
        <div
          className={`relative max-w-5xl mx-auto transition-all duration-1000 delay-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#0066ff]/20 via-transparent to-[#0066ff]/10 blur-2xl -z-10" />
          <TerminalBlock
            title="crewflow_main_orchestrator --v2.0"
            className="border-white/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)]"
          >
            <div className="space-y-3 aspect-[21/10]">
              <div className="flex gap-4">
                <span className="text-emerald-500 font-bold">➜</span>
                <span className="text-slate-300">
                  crewflow deploy{' '}
                  <TerminalHighlight>--squad</TerminalHighlight>{' '}
                  quantum-research
                </span>
              </div>
              <div className="text-slate-500">
                ... initializing neural interfaces
              </div>
              <div className="flex gap-4">
                <span className="text-slate-400">[info]</span>
                <span className="text-slate-300">
                  Agent{' '}
                  <TerminalHighlight color="indigo">
                    Research_Lead
                  </TerminalHighlight>{' '}
                  spawned (PID: 2842)
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-400">[info]</span>
                <span className="text-slate-300">
                  Agent{' '}
                  <TerminalHighlight color="pink">
                    Data_Synthesizer
                  </TerminalHighlight>{' '}
                  spawned (PID: 2843)
                </span>
              </div>
              <div className="flex gap-4 pl-4 border-l-2 border-[#0066ff]/30 py-2 my-4">
                <div className="space-y-1">
                  <div className="text-[#0066ff] font-bold">
                    ORCHESTRATION SYNC:
                  </div>
                  <div className="text-slate-400 text-xs">
                    Streaming context vectors across 4 nodes...
                  </div>
                  <div className="flex gap-1 mt-2">
                    <div className="h-1.5 w-12 bg-[#0066ff] rounded-full animate-pulse" />
                    <div className="h-1.5 w-8 bg-slate-700 rounded-full" />
                    <div className="h-1.5 w-16 bg-[#0066ff]/40 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-emerald-500 font-bold">➜</span>
                <span className="text-slate-300">
                  listening for agent tokens... <TerminalCursor />
                </span>
              </div>
            </div>

            {/* Background Grid */}
            <div className="absolute bottom-0 right-0 p-12 opacity-10 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                <path d="M50 10V90M10 50H90" stroke="white" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="4" fill="#0066ff" />
              </svg>
            </div>
          </TerminalBlock>
        </div>
      </div>
    </section>
  )
}

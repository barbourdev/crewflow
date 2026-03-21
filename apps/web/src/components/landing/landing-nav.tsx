'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from './glass-card'

interface NavItem {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Open Source', href: '#oss' },
  { label: 'Docs', href: '/docs' },
  { label: 'Settings', href: '/settings' },
]

const BRAND = 'CREWFLOW'

interface LandingNavProps {
  /** Se true, a navbar ja entra visivel sem animacao */
  skipAnimation?: boolean
}

export function LandingNav({ skipAnimation = false }: LandingNavProps) {
  const [phase, setPhase] = useState<'hidden' | 'slide' | 'logo' | 'typing' | 'done'>(
    skipAnimation ? 'done' : 'hidden',
  )
  const [typedCount, setTypedCount] = useState(0)

  useEffect(() => {
    if (skipAnimation) return

    // Phase 1: slide down (300ms delay)
    const t1 = setTimeout(() => setPhase('slide'), 300)
    // Phase 2: logo appears (800ms)
    const t2 = setTimeout(() => setPhase('logo'), 800)
    // Phase 3: start typing brand name (1200ms)
    const t3 = setTimeout(() => setPhase('typing'), 1200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [skipAnimation])

  // Typewriter para "CREWFLOW"
  useEffect(() => {
    if (phase !== 'typing') return

    if (typedCount < BRAND.length) {
      const t = setTimeout(() => setTypedCount((c) => c + 1), 70)
      return () => clearTimeout(t)
    } else {
      setPhase('done')
    }
  }, [phase, typedCount])

  const isVisible = phase !== 'hidden'
  const showLogo = phase === 'logo' || phase === 'typing' || phase === 'done'
  const showLinks = phase === 'done'
  const brandText = phase === 'done' ? BRAND : BRAND.slice(0, typedCount)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 lg:px-20 py-4 transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <GlassCard
        hover={false}
        rounded="2xl"
        className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto shadow-sm border-white/50"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className={`size-9 bg-[#0066ff] rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500 ${
              showLogo ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h2 className="text-slate-900 font-black tracking-tighter text-2xl overflow-hidden">
            <span className="inline-block">
              {brandText}
              {phase === 'typing' && (
                <span className="animate-pulse text-[#0066ff] ml-px">|</span>
              )}
            </span>
          </h2>
        </div>

        {/* Nav Links */}
        <nav
          className={`hidden md:flex items-center gap-10 transition-all duration-500 ${
            showLinks ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-slate-600 text-sm font-bold hover:text-[#0066ff] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div
          className={`flex items-center gap-4 transition-all duration-500 ${
            showLinks ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}
        >
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center justify-center rounded-xl h-10 px-6 bg-[#0066ff] text-white text-sm font-bold tracking-tight hover:opacity-90 transition-all shadow-[0_10px_40px_-10px_rgba(0,102,255,0.5)]"
          >
            Get Started
          </Link>
        </div>
      </GlassCard>
    </header>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { LandingNav } from './landing-nav'
import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { OssSection } from './oss-section'
import { CtaSection } from './cta-section'
import { LandingFooter } from './landing-footer'
import { RevealOnScroll } from './reveal-on-scroll'
import { BackgroundMesh } from './background-mesh'
import type { GitHubData } from '@/lib/github'

interface LandingOrchestratorProps {
  github: GitHubData
}

/**
 * Orquestra todas as animacoes da landing page:
 * 1. Navbar desce do topo com typewriter no "CREWFLOW"
 * 2. Titulo "SQUAD SYNCHRONY" digita letra por letra
 * 3. Apos titulo, restante do hero aparece (subtitle, CTAs, terminal)
 * 4. Secoes abaixo revelam no scroll
 */
export function LandingOrchestrator({ github }: LandingOrchestratorProps) {
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  return (
    <div className="min-h-screen font-sans text-slate-900 antialiased overflow-x-clip relative">
      <BackgroundMesh />

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <LandingNav />

        <main className="flex-1">
          <HeroSection onIntroComplete={handleIntroComplete} />

          {/* Secoes abaixo so aparecem apos intro + no scroll */}
          <div
            className={`transition-opacity duration-500 ${
              introComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <RevealOnScroll from="bottom">
              <FeaturesSection />
            </RevealOnScroll>

            <RevealOnScroll from="bottom" delay={100}>
              <OssSection github={github} />
            </RevealOnScroll>

            <RevealOnScroll from="scale" delay={100}>
              <CtaSection />
            </RevealOnScroll>
          </div>
        </main>

        <RevealOnScroll from="bottom">
          <LandingFooter />
        </RevealOnScroll>
      </div>
    </div>
  )
}

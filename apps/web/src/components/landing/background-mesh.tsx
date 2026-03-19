'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Background mesh interativo inspirado no antigravity.google.
 * Blobs de gradiente reagem ao mouse com parallax fluido.
 */

interface BlobConfig {
  baseX: number
  baseY: number
  size: number
  blur: number
  color: string
  parallaxFactor: number
  animDelay: number
}

const BLOBS: BlobConfig[] = [
  { baseX: -10, baseY: -10, size: 60, blur: 120, color: 'rgba(0, 102, 255, 0.10)', parallaxFactor: 30, animDelay: 0 },
  { baseX: 70, baseY: 70, size: 70, blur: 150, color: 'rgba(96, 165, 250, 0.10)', parallaxFactor: -20, animDelay: 2000 },
  { baseX: 30, baseY: 40, size: 40, blur: 100, color: 'rgba(99, 102, 241, 0.05)', parallaxFactor: 15, animDelay: 4000 },
  { baseX: 60, baseY: 10, size: 30, blur: 80, color: 'rgba(0, 102, 255, 0.06)', parallaxFactor: -25, animDelay: 3000 },
  { baseX: 10, baseY: 70, size: 25, blur: 90, color: 'rgba(139, 92, 246, 0.04)', parallaxFactor: 20, animDelay: 5000 },
]

export function BackgroundMesh() {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])
  const gridRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const glowPosRef = useRef({ x: 0, y: 0 })
  const glowTargetRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const currentRef = useRef(BLOBS.map(() => ({ x: 0, y: 0 })))

  const animate = useCallback(() => {
    const { x: mx, y: my } = mouseRef.current
    const nx = (mx - 0.5) * 2
    const ny = (my - 0.5) * 2

    // Blobs parallax
    BLOBS.forEach((blob, i) => {
      const el = blobRefs.current[i]
      if (!el) return
      const cur = currentRef.current[i]!
      const tx = nx * blob.parallaxFactor
      const ty = ny * blob.parallaxFactor
      cur.x += (tx - cur.x) * 0.04
      cur.y += (ty - cur.y) * 0.04
      el.style.transform = `translate(${cur.x}px, ${cur.y}px)`
    })

    // Grid parallax
    if (gridRef.current) {
      gridRef.current.style.transform = `translate(${nx * 5}px, ${ny * 5}px)`
    }

    // Mouse glow
    if (glowRef.current) {
      glowPosRef.current.x += (glowTargetRef.current.x - glowPosRef.current.x) * 0.06
      glowPosRef.current.y += (glowTargetRef.current.y - glowPosRef.current.y) * 0.06
      glowRef.current.style.background = `radial-gradient(600px circle at ${glowPosRef.current.x}px ${glowPosRef.current.y}px, rgba(0, 102, 255, 0.06), transparent 60%)`
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
      glowTargetRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      {/* Particle grid */}
      <div
        ref={gridRef}
        className="absolute inset-[-20px] will-change-transform"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0, 102, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Blobs */}
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          ref={(el) => { blobRefs.current[i] = el }}
          className="absolute rounded-full will-change-transform animate-blob"
          style={{
            left: `${blob.baseX}%`,
            top: `${blob.baseY}%`,
            width: `${blob.size}%`,
            height: `${blob.size}%`,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter: `blur(${blob.blur}px)`,
            animationDelay: `${blob.animDelay}ms`,
          }}
        />
      ))}

      {/* Mouse glow */}
      <div ref={glowRef} className="absolute inset-0 will-change-[background]" />
    </div>
  )
}

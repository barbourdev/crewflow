'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface RevealOnScrollProps {
  children: React.ReactNode
  className?: string
  /** Delay em ms antes de iniciar a animacao apos entrar no viewport */
  delay?: number
  /** Direcao de onde o conteudo vem */
  from?: 'bottom' | 'left' | 'right' | 'scale'
  /** Threshold do IntersectionObserver (0-1) */
  threshold?: number
}

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  from = 'bottom',
  threshold = 0.15,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay)
          } else {
            setIsVisible(true)
          }
          observer.unobserve(el)
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, threshold])

  const hiddenStyles = {
    bottom: 'translate-y-8 opacity-0',
    left: '-translate-x-8 opacity-0',
    right: 'translate-x-8 opacity-0',
    scale: 'scale-95 opacity-0',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? 'translate-y-0 translate-x-0 scale-100 opacity-100' : hiddenStyles[from],
        className,
      )}
    >
      {children}
    </div>
  )
}

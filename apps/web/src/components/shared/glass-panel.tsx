import { cn } from '@/lib/utils'

interface GlassPanelProps extends React.ComponentProps<'div'> {
  /** Borda azul sutil + sombra azul */
  accent?: boolean
}

/**
 * Painel glass reutilizavel no app (cards, forms, secoes).
 * Padrao Stitch: bg-white/70 backdrop-blur-[12px] border-white/30 rounded-xl
 */
export function GlassPanel({ accent, className, children, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'bg-white/70 backdrop-blur-[12px] border rounded-xl',
        accent
          ? 'border-[#0066ff]/20 shadow-xl shadow-[#0066ff]/5'
          : 'border-white/30',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

import { cn } from '@/lib/utils'

interface TerminalLine {
  prefix?: 'arrow' | 'info' | 'sync' | 'none'
  content: React.ReactNode
}

interface TerminalBlockProps {
  title?: string
  lines?: TerminalLine[]
  children?: React.ReactNode
  className?: string
  showDots?: boolean
}

function TerminalDots() {
  return (
    <div className="flex gap-2">
      <div className="size-3 rounded-full bg-red-500/80" />
      <div className="size-3 rounded-full bg-yellow-500/80" />
      <div className="size-3 rounded-full bg-green-500/80" />
    </div>
  )
}

const PREFIX_STYLES: Record<string, React.ReactNode> = {
  arrow: <span className="text-emerald-500 font-bold">➜</span>,
  info: <span className="text-slate-400">[info]</span>,
  sync: <span className="text-[#0066ff] font-bold">▸</span>,
}

export function TerminalBlock({
  title,
  lines,
  children,
  className,
  showDots = true,
}: TerminalBlockProps) {
  return (
    <div
      className={cn(
        'rounded-3xl overflow-hidden bg-[#0d1117] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white/5 relative',
        className,
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-white/5"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
        }}
      >
        {showDots && <TerminalDots />}
        {title && (
          <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase font-bold">
            {title}
          </div>
        )}
        <div className="size-4" />
      </div>

      {/* Content */}
      <div className="p-8 text-left font-mono text-sm leading-relaxed overflow-hidden">
        {children ?? (
          <div className="space-y-3">
            {lines?.map((line, i) => (
              <div key={i} className="flex gap-4">
                {line.prefix && line.prefix !== 'none' && PREFIX_STYLES[line.prefix]}
                <span className="text-slate-300">{line.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function TerminalHighlight({
  children,
  color = 'primary',
}: {
  children: React.ReactNode
  color?: 'primary' | 'indigo' | 'pink' | 'emerald'
}) {
  const colors = {
    primary: 'text-[#0066ff]',
    indigo: 'text-indigo-400',
    pink: 'text-pink-400',
    emerald: 'text-emerald-400',
  }
  return <span className={`${colors[color]} font-bold`}>{children}</span>
}

export function TerminalCursor() {
  return <span className="animate-pulse text-[#0066ff]">_</span>
}

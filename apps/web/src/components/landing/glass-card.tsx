import { cn } from '@/lib/utils'

interface GlassCardProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'dark' | 'subtle'
  hover?: boolean
  rounded?: 'xl' | '2xl' | '3xl' | '4xl'
}

export function GlassCard({
  variant = 'default',
  hover = true,
  rounded = '2xl',
  className,
  children,
  ...props
}: GlassCardProps) {
  const variants = {
    default:
      'bg-white/40 backdrop-blur-[20px] border border-white/50',
    dark:
      'bg-[rgba(10,15,24,0.7)] backdrop-blur-[24px] border border-white/10',
    subtle:
      'bg-white/60 backdrop-blur-xl border border-black/5',
  }

  const roundedMap = {
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-[3rem]',
    '4xl': 'rounded-[4rem]',
  }

  return (
    <div
      className={cn(
        variants[variant],
        roundedMap[rounded],
        hover && 'transition-all hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

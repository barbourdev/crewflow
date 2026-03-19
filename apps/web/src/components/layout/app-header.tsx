'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'

interface AppHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function AppHeader({ title, description, actions }: AppHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200/60 bg-white/30 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <h2 className="text-lg font-bold">{title}</h2>
        {description && (
          <span className="px-2 py-0.5 rounded bg-slate-100/50 text-[10px] font-bold text-slate-500 border border-slate-200/50 uppercase tracking-widest">
            {description}
          </span>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </header>
  )
}

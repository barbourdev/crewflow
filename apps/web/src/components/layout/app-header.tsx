'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface AppHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function AppHeader({ title, description, actions }: AppHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

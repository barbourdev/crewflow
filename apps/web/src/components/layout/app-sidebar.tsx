'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  BookOpen,
  Settings,
  ChevronsUpDown,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const navItems = [
    { title: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { title: t.nav.squads, href: '/squads', icon: Users },
    { title: t.nav.templates, href: '/templates', icon: FileText },
    { title: t.nav.metrics, href: '/metrics', icon: BarChart3 },
    { title: t.nav.docs, href: '/docs', icon: BookOpen },
  ]
  const [userName, setUserName] = useState('User')

  useEffect(() => {
    const fetchName = () => {
      fetch('/api/settings')
        .then((r) => r.ok ? r.json() : null)
        .then((json) => {
          if (json?.data?.name) setUserName(json.data.name)
        })
        .catch(() => {})
    }

    fetchName()

    // Escuta quando settings sao salvas
    window.addEventListener('settings-updated', fetchName)
    return () => window.removeEventListener('settings-updated', fetchName)
  }, [])

  return (
    <Sidebar className="border-r border-slate-200/60">
      {/* Logo */}
      <SidebarHeader className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-9 bg-[#0066ff] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0066ff]/20">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-slate-900 font-bold text-lg leading-none">CrewFlow</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
              {t.nav.managementConsole}
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Main nav */}
      <SidebarContent className="px-4 mt-4">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

            return (
              <SidebarMenuItem key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                    isActive
                      ? 'bg-[#0066ff]/10 text-[#0066ff]'
                      : 'text-slate-600 hover:bg-[#0066ff]/5'
                  }`}
                >
                  <item.icon className="size-[22px]" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer: Settings + User profile */}
      <SidebarFooter className="p-4 border-t border-[#0066ff]/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                pathname === '/settings'
                  ? 'bg-[#0066ff]/10 text-[#0066ff]'
                  : 'text-slate-600 hover:bg-[#0066ff]/5'
              }`}
            >
              <Settings className="size-[22px]" />
              <span>{t.nav.settings}</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User profile */}
        <div className="mt-4 flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-[#0066ff]/20 overflow-hidden border border-[#0066ff]/20 flex items-center justify-center text-[#0066ff] font-bold text-xs">
            {userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate">{userName}</p>
          </div>
          <ChevronsUpDown className="size-4 text-slate-400" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

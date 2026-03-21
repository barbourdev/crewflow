'use client'

import { SettingsContext, useSettingsLoader } from '@/hooks/use-settings'

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettingsLoader()

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}

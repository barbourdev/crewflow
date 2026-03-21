'use client'

import { useState, useEffect, useCallback } from 'react'
import { I18nContext, LOCALES, type SupportedLanguage } from '@/lib/i18n'
import { en } from '@/lib/i18n/locales/en'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>('en')

  const fetchLanguage = useCallback(() => {
    fetch('/api/settings')
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.data?.language) {
          setLanguage(json.data.language as SupportedLanguage)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchLanguage()
    window.addEventListener('settings-updated', fetchLanguage)
    return () => window.removeEventListener('settings-updated', fetchLanguage)
  }, [fetchLanguage])

  const t = LOCALES[language] ?? en

  return (
    <I18nContext.Provider value={{ t, language }}>
      {children}
    </I18nContext.Provider>
  )
}

'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

interface SettingsContextValue {
  betaFeatures: boolean
  verboseLogging: boolean
  loading: boolean
}

const SettingsContext = createContext<SettingsContextValue>({
  betaFeatures: false,
  verboseLogging: false,
  loading: true,
})

export function useSettings() {
  return useContext(SettingsContext)
}

export { SettingsContext }

export function useSettingsLoader(): SettingsContextValue {
  const [betaFeatures, setBetaFeatures] = useState(false)
  const [verboseLogging, setVerboseLogging] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(() => {
    fetch('/api/settings')
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.data?.preferences) {
          if (json.data.preferences.betaFeatures !== undefined) setBetaFeatures(json.data.preferences.betaFeatures)
          if (json.data.preferences.verboseLogging !== undefined) setVerboseLogging(json.data.preferences.verboseLogging)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchSettings()
    window.addEventListener('settings-updated', fetchSettings)
    return () => window.removeEventListener('settings-updated', fetchSettings)
  }, [fetchSettings])

  return { betaFeatures, verboseLogging, loading }
}

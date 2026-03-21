'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Key,
  SlidersHorizontal,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { ErrorBanner } from '@/components/shared/error-banner'
import { GlassPanel } from '@/components/shared/glass-panel'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Settings {
  id: string
  name: string
  email: string
  language: string
  apiKeys: Record<string, string>
}

interface KeyValidation {
  status: 'idle' | 'validating' | 'valid' | 'invalid'
  error?: string
}

// ---------------------------------------------------------------------------
// Toggle Switch
// ---------------------------------------------------------------------------

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
        checked ? 'bg-[#0066ff]' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 rounded-full bg-white border border-gray-300 shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        } mt-[2px]`}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Validation Status
// ---------------------------------------------------------------------------

function ValidationLabel({ validation }: { validation: KeyValidation }) {
  if (validation.status === 'idle') return null

  if (validation.status === 'validating') {
    return (
      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
        <Loader2 className="size-3.5 animate-spin" /> Validating...
      </span>
    )
  }

  if (validation.status === 'valid') {
    return (
      <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
        <CheckCircle2 className="size-3.5" /> Verified
      </span>
    )
  }

  return (
    <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
      <XCircle className="size-3.5" /> {validation.error ?? 'Not Validated'}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('en')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')

  // Toggles
  const [betaFeatures, setBetaFeatures] = useState(true)
  const [verboseLogging, setVerboseLogging] = useState(false)

  // Validation state
  const [anthropicValidation, setAnthropicValidation] = useState<KeyValidation>({ status: 'idle' })
  const [openaiValidation, setOpenaiValidation] = useState<KeyValidation>({ status: 'idle' })

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true)
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error('Failed to load settings')
        const json = (await res.json()) as { data: Settings }
        const s = json.data
        setName(s.name)
        setLanguage(s.language)
        if (s.apiKeys.anthropic) setAnthropicKey(s.apiKeys.anthropic)
        if (s.apiKeys.openai) setOpenaiKey(s.apiKeys.openai)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const validateKey = useCallback(async (provider: 'anthropic' | 'openai', apiKey: string) => {
    const setValidation = provider === 'anthropic' ? setAnthropicValidation : setOpenaiValidation

    if (!apiKey || apiKey.includes('...')) {
      setValidation({ status: 'idle' })
      return
    }

    setValidation({ status: 'validating' })

    try {
      const res = await fetch('/api/settings/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      })
      if (!res.ok) throw new Error('Validation request failed')
      const json = (await res.json()) as { data: { valid: boolean; error?: string } }

      if (json.data.valid) {
        setValidation({ status: 'valid' })
      } else {
        setValidation({ status: 'invalid', error: json.data.error ?? 'Invalid key' })
      }
    } catch {
      setValidation({ status: 'invalid', error: 'Validation failed' })
    }
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const body: Record<string, string> = { name, language }
      if (anthropicKey && !anthropicKey.includes('...')) body.anthropicApiKey = anthropicKey
      if (openaiKey && !openaiKey.includes('...')) body.openaiApiKey = openaiKey

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save settings')

      setSuccess(true)
      window.dispatchEvent(new Event('settings-updated'))
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    // Recarregar a pagina para resetar
    window.location.reload()
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Settings" description="Manage your workspace and integration preferences" />
        <div className="p-8 lg:p-12">
          <SettingsSkeleton />
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Settings" description="Manage your workspace and integration preferences" />

      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Error */}
          {error && <ErrorBanner message={error} />}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="size-4 shrink-0" />
              Settings saved successfully.
            </div>
          )}

          {/* ============================================================= */}
          {/* Profile Section                                                 */}
          {/* ============================================================= */}
          <GlassPanel accent className="p-8">
            <div className="flex items-center gap-2 mb-6 text-[#0066ff]">
              <User className="size-5" />
              <h3 className="text-xl font-bold">Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] outline-none transition-all appearance-none"
                >
                  <option value="en">English (US)</option>
                  <option value="pt-BR">Portugues (BR)</option>
                  <option value="es">Espanol</option>
                </select>
              </div>
            </div>
          </GlassPanel>

          {/* ============================================================= */}
          {/* API Integrations                                                */}
          {/* ============================================================= */}
          <GlassPanel accent className="p-8">
            <div className="flex items-center gap-2 mb-6 text-[#0066ff]">
              <Key className="size-5" />
              <h3 className="text-xl font-bold">API Integrations</h3>
            </div>

            <div className="space-y-6">
              {/* Anthropic */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-bold text-slate-700">Anthropic API Key</label>
                  <ValidationLabel validation={anthropicValidation} />
                </div>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={anthropicKey}
                    onChange={(e) => {
                      setAnthropicKey(e.target.value)
                      setAnthropicValidation({ status: 'idle' })
                    }}
                    placeholder="sk-ant-..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] outline-none transition-all"
                  />
                  <button
                    onClick={() => validateKey('anthropic', anthropicKey)}
                    disabled={!anthropicKey || anthropicKey.includes('...') || anthropicValidation.status === 'validating'}
                    className={`px-6 py-3 font-bold rounded-lg transition-all disabled:opacity-50 ${
                      anthropicValidation.status === 'valid'
                        ? 'bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff]/20'
                        : 'bg-[#0066ff] text-white hover:bg-[#0066ff]/90 shadow-lg shadow-[#0066ff]/20'
                    }`}
                  >
                    {anthropicValidation.status === 'validating' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      'Validate'
                    )}
                  </button>
                </div>
              </div>

              {/* OpenAI */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-bold text-slate-700">OpenAI API Key</label>
                  <ValidationLabel validation={openaiValidation} />
                </div>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => {
                      setOpenaiKey(e.target.value)
                      setOpenaiValidation({ status: 'idle' })
                    }}
                    placeholder="sk-proj-..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] outline-none transition-all"
                  />
                  <button
                    onClick={() => validateKey('openai', openaiKey)}
                    disabled={!openaiKey || openaiKey.includes('...') || openaiValidation.status === 'validating'}
                    className={`px-6 py-3 font-bold rounded-lg transition-all disabled:opacity-50 ${
                      openaiValidation.status === 'valid'
                        ? 'bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff]/20'
                        : 'bg-[#0066ff] text-white hover:bg-[#0066ff]/90 shadow-lg shadow-[#0066ff]/20'
                    }`}
                  >
                    {openaiValidation.status === 'validating' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      'Validate'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* ============================================================= */}
          {/* Advanced Options                                                */}
          {/* ============================================================= */}
          <GlassPanel accent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-[#0066ff]">
                <SlidersHorizontal className="size-5" />
                <h3 className="text-xl font-bold">Advanced Options</h3>
              </div>
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded uppercase tracking-wider text-slate-500">
                Platform Tweaks
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-[#0066ff]/5">
                <div>
                  <p className="font-bold text-slate-800">Experimental Beta Features</p>
                  <p className="text-sm text-slate-500">Access unreleased AI agent capabilities</p>
                </div>
                <Toggle checked={betaFeatures} onChange={setBetaFeatures} />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-[#0066ff]/5">
                <div>
                  <p className="font-bold text-slate-800">Verbose Logging</p>
                  <p className="text-sm text-slate-500">Enable detailed API response debugging</p>
                </div>
                <Toggle checked={verboseLogging} onChange={setVerboseLogging} />
              </div>
            </div>
          </GlassPanel>

          {/* ============================================================= */}
          {/* Actions                                                         */}
          {/* ============================================================= */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              onClick={handleDiscard}
              className="px-8 py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors"
            >
              Discard changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-4 bg-[#0066ff] text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#0066ff]/30 transition-all disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Save,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Key,
  Globe,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { AppHeader } from '@/components/layout/app-header'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Settings {
  id: string
  name: string
  email: string
  language: string
  currency: string
  apiKeys: Record<string, string>
}

interface KeyValidation {
  status: 'idle' | 'validating' | 'valid' | 'invalid'
  error?: string
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SettingsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-40" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
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
  const [currency, setCurrency] = useState('USD')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')

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
        setCurrency(s.currency)
        // Masked keys are displayed as placeholder hints
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
        setValidation({ status: 'invalid', error: json.data.error })
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

      const body: Record<string, string> = { name, language, currency }

      // Only send keys if they look like real keys (not masked)
      if (anthropicKey && !anthropicKey.includes('...')) {
        body.anthropicApiKey = anthropicKey
      }
      if (openaiKey && !openaiKey.includes('...')) {
        body.openaiApiKey = openaiKey
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to save settings')

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Settings" />
        <SettingsSkeleton />
      </>
    )
  }

  return (
    <>
      <AppHeader title="Settings" />

      <div className="flex flex-1 flex-col gap-6 p-6 max-w-2xl">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-500">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Settings saved successfully.
          </div>
        )}

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-amber" />
              <CardTitle className="text-sm">Profile</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Your personal information and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  <Globe className="h-3 w-3" />
                  Language
                </Label>
                <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt-BR">Portugues (BR)</SelectItem>
                    <SelectItem value="es">Espanol</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Currency</Label>
                <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="BRL">BRL (R$)</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* API Keys Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-amber" />
              <CardTitle className="text-sm">API Keys</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Configure your LLM provider API keys. Keys are stored encrypted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Anthropic */}
            <div className="space-y-1.5">
              <Label htmlFor="anthropic-key" className="text-xs">Anthropic API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="anthropic-key"
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => {
                    setAnthropicKey(e.target.value)
                    setAnthropicValidation({ status: 'idle' })
                  }}
                  placeholder="sk-ant-..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => validateKey('anthropic', anthropicKey)}
                  disabled={!anthropicKey || anthropicKey.includes('...') || anthropicValidation.status === 'validating'}
                >
                  {anthropicValidation.status === 'validating' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    'Validate'
                  )}
                </Button>
              </div>
              <ValidationStatus validation={anthropicValidation} />
            </div>

            {/* OpenAI */}
            <div className="space-y-1.5">
              <Label htmlFor="openai-key" className="text-xs">OpenAI API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="openai-key"
                  type="password"
                  value={openaiKey}
                  onChange={(e) => {
                    setOpenaiKey(e.target.value)
                    setOpenaiValidation({ status: 'idle' })
                  }}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => validateKey('openai', openaiKey)}
                  disabled={!openaiKey || openaiKey.includes('...') || openaiValidation.status === 'validating'}
                >
                  {openaiValidation.status === 'validating' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    'Validate'
                  )}
                </Button>
              </div>
              <ValidationStatus validation={openaiValidation} />
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button
            className="bg-amber text-black hover:bg-amber/90"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Validation Status indicator
// ---------------------------------------------------------------------------

function ValidationStatus({ validation }: { validation: KeyValidation }) {
  if (validation.status === 'idle') return null

  if (validation.status === 'validating') {
    return (
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Validating...
      </p>
    )
  }

  if (validation.status === 'valid') {
    return (
      <p className="flex items-center gap-1 text-xs text-emerald-500">
        <CheckCircle2 className="h-3 w-3" />
        Valid API key
      </p>
    )
  }

  return (
    <p className="flex items-center gap-1 text-xs text-destructive">
      <XCircle className="h-3 w-3" />
      {validation.error ?? 'Invalid API key'}
    </p>
  )
}

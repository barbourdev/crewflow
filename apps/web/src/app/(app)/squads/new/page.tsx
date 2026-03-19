'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Rocket,
  Smile,
  PenLine,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { GlassPanel } from '@/components/shared/glass-panel'
import { FormField, FormInput, FormTextarea } from '@/components/shared/form-field'
import { ErrorBanner } from '@/components/shared/error-banner'
import { DashedHint } from '@/components/shared/dashed-hint'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewSquadPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canCreate = name.trim().length > 0

  const handleCreate = async () => {
    if (!canCreate) return

    try {
      setCreating(true)
      setError(null)

      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } }
        throw new Error(json.error?.message ?? 'Failed to create squad')
      }

      const json = (await res.json()) as { data: { id: string } }
      router.push(`/squads/${json.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <AppHeader
        title="Create Squad"
        description="Start a new squad from a template or from scratch"
        actions={
          <Link
            href="/squads"
            className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          {error && <ErrorBanner message={error} className="mb-8" />}

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: Start from Template */}
            <TemplateCard />

            {/* Right: Create from Scratch */}
            <div className="flex flex-col gap-6">
              <GlassPanel accent className="p-8">
                <ScratchFormHeader />
                <ScratchForm
                  name={name}
                  description={description}
                  icon={icon}
                  onNameChange={setName}
                  onDescriptionChange={setDescription}
                  onIconChange={setIcon}
                  onSubmit={handleCreate}
                  canSubmit={canCreate}
                  submitting={creating}
                />
              </GlassPanel>

              <DashedHint
                text="Looking for workspace settings?"
                linkText="Click here"
                href="/settings"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Template Card (left column)
// ---------------------------------------------------------------------------

function TemplateCard() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/templates" className="block h-full">
        <GlassPanel className="p-8 flex flex-col h-full hover:shadow-xl hover:shadow-[#0066ff]/5 transition-all group">
          <div className="size-14 rounded-2xl bg-[#0066ff]/10 flex items-center justify-center text-[#0066ff] mb-6">
            <Sparkles className="size-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Start from Template</h3>
          <p className="text-slate-500 leading-relaxed mb-8">
            Accelerate your workflow with pre-built squad structures for engineering, design, or marketing.
          </p>
          <div className="mt-auto">
            <span className="flex items-center gap-2 text-[#0066ff] font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Browse templates
              <ArrowRight className="size-4" />
            </span>
          </div>

          {/* Preview placeholder */}
          <div className="mt-10 rounded-xl overflow-hidden aspect-video relative bg-gradient-to-br from-[#0066ff]/10 to-[#0066ff]/5">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-3">
                <div className="w-20 h-14 rounded-lg bg-white/60 backdrop-blur-sm border border-white/40" />
                <div className="w-20 h-14 rounded-lg bg-white/60 backdrop-blur-sm border border-white/40" />
                <div className="w-20 h-14 rounded-lg bg-white/60 backdrop-blur-sm border border-white/40" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0066ff]/20 to-transparent" />
          </div>
        </GlassPanel>
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scratch Form Header
// ---------------------------------------------------------------------------

function ScratchFormHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="size-12 rounded-full bg-[#FFB800]/20 flex items-center justify-center text-[#FFB800]">
        <PenLine className="size-5" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">Create Squad</h3>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scratch Form
// ---------------------------------------------------------------------------

function ScratchForm({
  name,
  description,
  icon,
  onNameChange,
  onDescriptionChange,
  onIconChange,
  onSubmit,
  canSubmit,
  submitting,
}: {
  name: string
  description: string
  icon: string
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onIconChange: (v: string) => void
  onSubmit: () => void
  canSubmit: boolean
  submitting: boolean
}) {
  return (
    <div className="space-y-6">
      <FormField label="Name" required>
        <FormInput
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Apollo Mission"
        />
      </FormField>

      <FormField label="Description">
        <FormTextarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="What does this squad do?"
          rows={4}
        />
      </FormField>

      <FormField label="Icon (emoji)">
        <div className="relative">
          <Smile className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
          <FormInput
            value={icon}
            onChange={(e) => onIconChange(e.target.value)}
            placeholder="e.g. rocket, lightbulb, ..."
            className="pl-12"
          />
        </div>
      </FormField>

      <div className="pt-4">
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className="w-full py-4 bg-[#FFB800] hover:bg-[#FFB800]/90 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-[#FFB800]/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Create Squad
              <Rocket className="size-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

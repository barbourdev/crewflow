'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Rocket,
  PenLine,
  Wand2,
  Zap,
  Brain,
  Code,
  Globe,
  Target,
  Shield,
  Heart,
  Star,
  Flame,
  Compass,
  Eye,
  Lightbulb,
  Music,
  Camera,
  Palette,
  Megaphone,
  TrendingUp,
  Users,
  MessageSquare,
  FileText,
  Database,
  Terminal,
  Cpu,
  Radio,
  Layers,
  BookOpen,
  Briefcase,
  Coffee,
  Gem,
  Crown,
  Swords,
  Bot,
  Smile,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { GlassPanel } from '@/components/shared/glass-panel'
import { FormField, FormInput } from '@/components/shared/form-field'
import { ErrorBanner } from '@/components/shared/error-banner'

// ---------------------------------------------------------------------------
// Icon Library
// ---------------------------------------------------------------------------

const ICON_LIBRARY: { name: string; icon: LucideIcon }[] = [
  { name: 'rocket', icon: Rocket },
  { name: 'zap', icon: Zap },
  { name: 'brain', icon: Brain },
  { name: 'code', icon: Code },
  { name: 'globe', icon: Globe },
  { name: 'target', icon: Target },
  { name: 'shield', icon: Shield },
  { name: 'star', icon: Star },
  { name: 'flame', icon: Flame },
  { name: 'compass', icon: Compass },
  { name: 'eye', icon: Eye },
  { name: 'lightbulb', icon: Lightbulb },
  { name: 'sparkles', icon: Sparkles },
  { name: 'wand', icon: Wand2 },
  { name: 'heart', icon: Heart },
  { name: 'music', icon: Music },
  { name: 'camera', icon: Camera },
  { name: 'palette', icon: Palette },
  { name: 'megaphone', icon: Megaphone },
  { name: 'trending', icon: TrendingUp },
  { name: 'users', icon: Users },
  { name: 'message', icon: MessageSquare },
  { name: 'file', icon: FileText },
  { name: 'database', icon: Database },
  { name: 'terminal', icon: Terminal },
  { name: 'cpu', icon: Cpu },
  { name: 'radio', icon: Radio },
  { name: 'layers', icon: Layers },
  { name: 'book', icon: BookOpen },
  { name: 'briefcase', icon: Briefcase },
  { name: 'coffee', icon: Coffee },
  { name: 'gem', icon: Gem },
  { name: 'crown', icon: Crown },
  { name: 'swords', icon: Swords },
  { name: 'bot', icon: Bot },
  { name: 'pen', icon: PenLine },
]

const ICON_COLORS = [
  { name: 'blue', value: '#0066ff' },
  { name: 'purple', value: '#8b5cf6' },
  { name: 'pink', value: '#ec4899' },
  { name: 'red', value: '#ef4444' },
  { name: 'orange', value: '#f97316' },
  { name: 'amber', value: '#f59e0b' },
  { name: 'green', value: '#22c55e' },
  { name: 'teal', value: '#14b8a6' },
  { name: 'cyan', value: '#06b6d4' },
  { name: 'slate', value: '#64748b' },
]

// ---------------------------------------------------------------------------
// Icon Picker
// ---------------------------------------------------------------------------

function IconPicker({
  selectedIcon,
  selectedColor,
  onSelect,
  onColorChange,
}: {
  selectedIcon: string
  selectedColor: string
  onSelect: (name: string) => void
  onColorChange: (color: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {ICON_COLORS.map((c) => (
          <button
            key={c.name}
            onClick={() => onColorChange(c.value)}
            className={`size-6 rounded-full transition-all ${
              selectedColor === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>

      <div className="grid grid-cols-9 gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
        {ICON_LIBRARY.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className={`size-8 rounded-lg flex items-center justify-center transition-all ${
              selectedIcon === name
                ? 'bg-white shadow-sm ring-2 scale-110'
                : 'hover:bg-white hover:shadow-sm'
            }`}
            style={{
              color: selectedIcon === name ? selectedColor : '#94a3b8',
              ...(selectedIcon === name ? { outlineColor: selectedColor } : {}),
            }}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>

      {selectedIcon && (
        <div className="flex items-center gap-3">
          <div
            className="size-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: selectedColor + '15', color: selectedColor }}
          >
            {(() => {
              const entry = ICON_LIBRARY.find((i) => i.name === selectedIcon)
              if (!entry) return null
              const Icon = entry.icon
              return <Icon className="size-6" />
            })()}
          </div>
          <span className="text-xs text-slate-500">Preview</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewSquadPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('rocket')
  const [selectedColor, setSelectedColor] = useState('#0066ff')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canCreate = name.trim().length > 0

  const handleCreateEmpty = async () => {
    if (!canCreate) return
    try {
      setCreating(true)
      setError(null)

      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          icon: selectedIcon,
          gradient: `icon:${selectedIcon}:${selectedColor}`,
        }),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } }
        throw new Error(json.error?.message ?? 'Falha ao criar squad')
      }

      const json = (await res.json()) as { data: { id: string } }
      router.push(`/squads/${json.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setCreating(false)
    }
  }

  const SelectedIconComponent = ICON_LIBRARY.find((i) => i.name === selectedIcon)?.icon ?? Rocket

  return (
    <>
      <AppHeader
        title="Create Squad"
        description="Start a new squad with AI assistance"
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

            {/* Right: Create Squad */}
            <div className="flex flex-col gap-6">
              <GlassPanel accent className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div
                    className="size-14 rounded-2xl flex items-center justify-center transition-colors"
                    style={{ backgroundColor: selectedColor + '15', color: selectedColor }}
                  >
                    <SelectedIconComponent className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Create Squad</h3>
                    <p className="text-xs text-slate-500">Name your squad and let the Architect design it</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <FormField label="Name" required>
                    <FormInput
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Instagram Content, Code Review, Blog Writer..."
                    />
                  </FormField>

                  <FormField label="Icon">
                    <IconPicker
                      selectedIcon={selectedIcon}
                      selectedColor={selectedColor}
                      onSelect={setSelectedIcon}
                      onColorChange={setSelectedColor}
                    />
                  </FormField>

                  <div className="pt-4 space-y-3">
                    {/* Primary: Create with Architect */}
                    <Link
                      href={`/squads/new/architect?name=${encodeURIComponent(name.trim())}&icon=${encodeURIComponent(selectedIcon)}&color=${encodeURIComponent(selectedColor)}`}
                      className={`w-full py-4 bg-[#0066ff] hover:bg-[#0066ff]/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0066ff]/20 flex items-center justify-center gap-2 group ${
                        !canCreate ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <Wand2 className="size-4" />
                      Create with Architect
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Secondary: Create empty */}
                    <button
                      onClick={handleCreateEmpty}
                      disabled={!canCreate || creating}
                      className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <>
                          <PenLine className="size-3.5" />
                          Create Empty Squad
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

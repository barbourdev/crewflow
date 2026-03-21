'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  DollarSign,
  Search,
  Loader2,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { ErrorBanner } from '@/components/shared/error-banner'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Template {
  id: string
  name: string
  description: string
  icon: string
  category: string
  estimatedTime: string
  estimatedCost: string
}

type CategoryFilter = 'all' | 'content' | 'development'

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'content', label: 'Content' },
  { key: 'development', label: 'Development' },
]

// Gradiente por categoria, identico ao Stitch
const CATEGORY_GRADIENTS: Record<string, string[]> = {
  content: [
    'from-pink-500 to-orange-400',
    'from-blue-500 to-cyan-400',
    'from-indigo-600 to-blue-700',
    'from-red-600 to-rose-500',
  ],
  development: [
    'from-emerald-500 to-teal-400',
    'from-amber-500 to-orange-400',
    'from-purple-600 to-violet-500',
    'from-slate-700 to-slate-900',
    'from-blue-900 to-indigo-900',
    'from-lime-500 to-green-400',
  ],
  marketing: [
    'from-fuchsia-500 to-pink-400',
    'from-orange-500 to-amber-400',
    'from-sky-500 to-blue-400',
  ],
}

function getGradient(category: string, index: number): string {
  const gradients = CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.content!
  return gradients[index % gradients.length]!
}

// ---------------------------------------------------------------------------
// Template Card - fiel ao Stitch
// ---------------------------------------------------------------------------

function TemplateCard({
  template,
  index,
  onUse,
  loading,
}: {
  template: Template
  index: number
  onUse: (id: string) => void
  loading: boolean
}) {
  const { t } = useTranslation()
  const gradient = getGradient(template.category, index)

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all group">
      {/* Gradient banner */}
      <div className={`h-40 bg-gradient-to-br ${gradient} relative`}>
        <span className="absolute top-3 right-3 px-2 py-1 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
          {template.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-[#0066ff] transition-colors">
          {template.name}
        </h3>
        <p className="text-xs text-slate-500 mb-4 flex-1 leading-relaxed">
          {template.description}
        </p>

        {/* Time + Cost */}
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {template.estimatedTime}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="size-3.5" />
            {template.estimatedCost}
          </span>
        </div>

        {/* Use Template button */}
        <button
          onClick={() => onUse(template.id)}
          disabled={loading}
          className="w-full bg-[#0066ff]/10 hover:bg-[#0066ff] text-[#0066ff] hover:text-white font-bold py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin mx-auto" />
          ) : (
            t.templates.useTemplate
          )}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function TemplateCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      <Skeleton className="h-40 rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TemplatesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [search, setSearch] = useState('')
  const [creatingId, setCreatingId] = useState<string | null>(null)

  const handleUseTemplate = useCallback(async (templateId: string) => {
    if (creatingId) return
    setCreatingId(templateId)
    try {
      const res = await fetch(`/api/templates/${templateId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error('Falha ao criar squad')
      const json = (await res.json()) as { data: { id: string } }
      router.push(`/squads/${json.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar squad')
      setCreatingId(null)
    }
  }, [creatingId, router])

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/templates?limit=50')
        if (!res.ok) throw new Error('Failed to load templates')
        const json = (await res.json()) as { data: Template[] }
        setTemplates(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  const filtered = useMemo(() => {
    let result = templates
    if (category !== 'all') {
      result = result.filter((t) => t.category === category)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      )
    }
    return result
  }, [templates, category, search])

  return (
    <>
      <AppHeader
        title={t.templates.title}
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.templates.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-72 focus:ring-2 focus:ring-[#0066ff]/50 outline-none transition-all"
              />
            </div>
          </div>
        }
      />

      {/* Filters */}
      <div className="px-8 py-6 flex items-center gap-4 shrink-0">
        <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                category === cat.key
                  ? 'bg-[#0066ff] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-12">
        {error && <ErrorBanner message={error} className="mb-6" />}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <TemplateCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-slate-500">
              {search ? 'No templates match your search.' : 'No templates found in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filtered.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={i}
                onUse={handleUseTemplate}
                loading={creatingId === template.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

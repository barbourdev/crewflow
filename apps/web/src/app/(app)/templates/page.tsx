'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Clock,
  DollarSign,
  LayoutTemplate,
  FileText,
  Code,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { AppHeader } from '@/components/layout/app-header'

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

const CATEGORY_META: Record<CategoryFilter, { label: string; icon: typeof LayoutTemplate }> = {
  all: { label: 'All', icon: LayoutTemplate },
  content: { label: 'Content', icon: FileText },
  development: { label: 'Development', icon: Code },
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function TemplateCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex items-center gap-4 pt-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="mt-2 h-8 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<CategoryFilter>('all')
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
    if (category === 'all') return templates
    return templates.filter((t) => t.category === category)
  }, [templates, category])

  return (
    <>
      <AppHeader
        title="Templates"
        description="Ready-made squad templates"
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Category filter */}
        <Tabs defaultValue="all" onValueChange={(v) => setCategory(v as CategoryFilter)}>
          <TabsList>
            {(Object.keys(CATEGORY_META) as CategoryFilter[]).map((key) => {
              const meta = CATEGORY_META[key]
              return (
                <TabsTrigger key={key} value={key}>
                  <meta.icon className="mr-1 h-3.5 w-3.5" />
                  {meta.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* We use a single TabsContent that is always visible */}
          {(Object.keys(CATEGORY_META) as CategoryFilter[]).map((key) => (
            <TabsContent key={key} value={key}>
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TemplateCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Content */}
              {!loading && !error && (
                <>
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                      <LayoutTemplate className="h-10 w-10 opacity-40" />
                      <p className="text-sm">No templates found in this category.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filtered.map((template) => (
                        <Card key={template.id} className="flex flex-col">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber/10 text-lg">
                                {template.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="truncate text-sm">
                                  {template.name}
                                </CardTitle>
                                <Badge variant="secondary" className="mt-1 text-[10px] capitalize">
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="flex flex-1 flex-col gap-3">
                            <CardDescription className="line-clamp-2 text-xs">
                              {template.description}
                            </CardDescription>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {template.estimatedTime}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {template.estimatedCost}
                              </span>
                            </div>

                            <div className="mt-auto pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-amber/30 text-amber hover:bg-amber/10"
                                onClick={() => handleUseTemplate(template.id)}
                                disabled={creatingId !== null}
                              >
                                {creatingId === template.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                {creatingId === template.id ? 'Criando...' : 'Use Template'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}

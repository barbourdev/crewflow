'use client'

import { useEffect, useState } from 'react'
import {
  Puzzle,
  AlertCircle,
  Terminal,
  MessageSquare,
  Combine,
  Server,
  CheckCircle2,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AppHeader } from '@/components/layout/app-header'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Skill {
  id: string
  name: string
  description: string
  type: string
  icon: string
  isBuiltin: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<string, { icon: typeof Terminal; label: string; className: string }> = {
  mcp: { icon: Server, label: 'MCP', className: 'bg-violet-100 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20' },
  script: { icon: Terminal, label: 'Script', className: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
  prompt: { icon: MessageSquare, label: 'Prompt', className: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  hybrid: { icon: Combine, label: 'Hybrid', className: 'bg-primary/10 text-primary border-primary/20' },
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkillCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="mt-1.5 h-3 w-3/4" />
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSkills() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/skills')
        if (!res.ok) throw new Error('Failed to load skills')
        const json = (await res.json()) as { data: Skill[] }
        setSkills(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchSkills()
  }, [])

  return (
    <>
      <AppHeader
        title="Skills"
        description="Tools and skills available for your agents"
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
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
              <SkillCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                <Puzzle className="h-12 w-12 opacity-30" />
                <p className="text-sm font-medium">No skills available</p>
                <p className="text-xs">Skills will appear here as they are installed.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {skills.map((skill) => {
                  const tc = (TYPE_CONFIG[skill.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.script)!
                  const TypeIcon = tc.icon

                  return (
                    <Card key={skill.id} className="card-hover">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                            {skill.icon || <Puzzle className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="truncate text-sm">
                                {skill.name}
                              </CardTitle>
                              {skill.isBuiltin && (
                                <Badge variant="secondary" className="shrink-0 text-[10px]">
                                  <CheckCircle2 className="mr-0.5 h-2.5 w-2.5 text-emerald-500" />
                                  Installed
                                </Badge>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className={`mt-1 text-[10px] ${tc.className}`}
                            >
                              <TypeIcon className="mr-0.5 h-2.5 w-2.5" />
                              {tc.label}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2 text-xs">
                          {skill.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

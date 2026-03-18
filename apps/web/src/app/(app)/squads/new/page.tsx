'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutTemplate,
  PenLine,
  ArrowRight,
  Loader2,
  AlertCircle,
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
import { AppHeader } from '@/components/layout/app-header'

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
          <Button variant="ghost" size="sm" render={<Link href="/squads" />}>
            Cancel
          </Button>
        }
      />

      <div className="flex flex-1 flex-col gap-6 p-6 max-w-2xl">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Option cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Start from template */}
          <Link href="/templates" className="group">
            <Card className="h-full transition-colors group-hover:ring-amber/30">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber/10">
                  <LayoutTemplate className="h-6 w-6 text-amber" />
                </div>
                <CardTitle className="mt-3 text-sm">Start from Template</CardTitle>
                <CardDescription className="text-xs">
                  Choose from ready-made squad configurations with pre-built agents and pipelines.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber">
                  Browse templates
                  <ArrowRight className="h-3 w-3" />
                </span>
              </CardContent>
            </Card>
          </Link>

          {/* Create from scratch */}
          <Card className="h-full border-amber/20">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber/10">
                <PenLine className="h-6 w-6 text-amber" />
              </div>
              <CardTitle className="mt-3 text-sm">Create from Scratch</CardTitle>
              <CardDescription className="text-xs">
                Start with an empty squad and configure agents and pipeline manually.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="squad-name" className="text-xs">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="squad-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My New Squad"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="squad-description" className="text-xs">Description</Label>
                <Input
                  id="squad-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this squad do?"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="squad-icon" className="text-xs">Icon (emoji)</Label>
                <Input
                  id="squad-icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. rocket, lightbulb, robot"
                  className="w-40"
                />
              </div>

              <Separator />

              <Button
                className="w-full bg-amber text-black hover:bg-amber/90"
                disabled={!canCreate || creating}
                onClick={handleCreate}
              >
                {creating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <PenLine className="h-3.5 w-3.5" />
                )}
                {creating ? 'Creating...' : 'Create Squad'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

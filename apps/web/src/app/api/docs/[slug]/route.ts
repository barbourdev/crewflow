import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { success, notFound, handleError } from '@/lib/api-response'

// Mapa de slugs para arquivos .md
const DOCS_MAP: Record<string, { file: string; title: string; category: string }> = {
  'getting-started': { file: 'README.md', title: 'Getting Started', category: 'Introduction' },
  'architecture': { file: 'ARCHITECTURE.md', title: 'Architecture', category: 'Introduction' },
  'api-reference': { file: 'docs/API.md', title: 'API Reference', category: 'Reference' },
  'contributing': { file: 'CONTRIBUTING.md', title: 'Contributing', category: 'Community' },
  'changelog': { file: 'CHANGELOG.md', title: 'Changelog', category: 'Community' },
  'code-of-conduct': { file: 'CODE_OF_CONDUCT.md', title: 'Code of Conduct', category: 'Community' },
  'spec': { file: 'SPEC.md', title: 'Specification', category: 'Reference' },
}

// Raiz do projeto (apps/web -> raiz do monorepo)
const PROJECT_ROOT = join(process.cwd(), '..', '..')

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    // Listar todos os docs
    if (slug === 'index') {
      const docs = Object.entries(DOCS_MAP).map(([slug, info]) => ({
        slug,
        ...info,
      }))
      return success({ docs })
    }

    const docInfo = DOCS_MAP[slug]
    if (!docInfo) return notFound('Document')

    const filePath = join(PROJECT_ROOT, docInfo.file)
    const content = await readFile(filePath, 'utf-8')

    return success({
      slug,
      title: docInfo.title,
      category: docInfo.category,
      content,
    })
  } catch (err) {
    return handleError(err)
  }
}

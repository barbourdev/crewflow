'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  BookOpen,
  FileCode2,
  Users,
  ChevronRight,
  Search,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'

// ---------------------------------------------------------------------------
// Doc navigation structure
// ---------------------------------------------------------------------------

const CATEGORIES = [
  {
    name: 'Introduction',
    icon: BookOpen,
    items: [
      { slug: 'getting-started', title: 'Getting Started' },
      { slug: 'architecture', title: 'Architecture' },
    ],
  },
  {
    name: 'Reference',
    icon: FileCode2,
    items: [
      { slug: 'api-reference', title: 'API Reference' },
      { slug: 'spec', title: 'Specification' },
    ],
  },
  {
    name: 'Community',
    icon: Users,
    items: [
      { slug: 'contributing', title: 'Contributing' },
      { slug: 'changelog', title: 'Changelog' },
      { slug: 'code-of-conduct', title: 'Code of Conduct' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Sidebar with navigation + "On this page" hierarchy
// ---------------------------------------------------------------------------

function DocsSidebar({ currentSlug, searchQuery, onSearch }: {
  currentSlug: string
  searchQuery: string
  onSearch: (q: string) => void
}) {
  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0)

  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r border-slate-200/60 bg-white/40 backdrop-blur-sm">
      <div className="p-4">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white/70 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff]/40 placeholder:text-slate-400"
          />
        </div>

        {/* Nav categories */}
        <nav className="space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center gap-2 mb-2 px-2">
                <category.icon className="size-3.5 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {category.name}
                </span>
              </div>
              <ul className="space-y-0.5">
                {category.items.map((item) => {
                  const isActive = item.slug === currentSlug
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-[#0066ff]/10 text-[#0066ff] font-semibold'
                            : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Markdown renderer with custom components
// ---------------------------------------------------------------------------

function MarkdownContent({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, ...props }) => {
          const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
          return (
            <h1 id={id} className="text-3xl font-bold text-slate-900 mt-10 mb-4 pb-3 border-b border-slate-200/60 scroll-mt-20 first:mt-0" {...props}>
              {children}
            </h1>
          )
        },
        h2: ({ children, ...props }) => {
          const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
          return (
            <h2 id={id} className="text-xl font-bold text-slate-900 mt-10 mb-3 pb-2 border-b border-slate-100 scroll-mt-20" {...props}>
              <a href={`#${id}`} className="hover:text-[#0066ff] transition-colors">{children}</a>
            </h2>
          )
        },
        h3: ({ children, ...props }) => {
          const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
          return (
            <h3 id={id} className="text-lg font-semibold text-slate-800 mt-8 mb-2 scroll-mt-20" {...props}>
              <a href={`#${id}`} className="hover:text-[#0066ff] transition-colors">{children}</a>
            </h3>
          )
        },
        h4: ({ children, ...props }) => (
          <h4 className="text-base font-semibold text-slate-700 mt-6 mb-2" {...props}>{children}</h4>
        ),
        p: ({ children, ...props }) => (
          <p className="text-sm text-slate-600 leading-relaxed mb-4" {...props}>{children}</p>
        ),
        a: ({ children, href, ...props }) => {
          const isExternal = href?.startsWith('http')
          return (
            <a
              href={href}
              className="text-[#0066ff] hover:text-[#0052cc] font-medium underline decoration-[#0066ff]/30 hover:decoration-[#0066ff]/60 transition-colors inline-flex items-center gap-0.5"
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
              {isExternal && <ExternalLink className="size-3 inline" />}
            </a>
          )
        },
        ul: ({ children, ...props }) => (
          <ul className="text-sm text-slate-600 space-y-1.5 mb-4 ml-1" {...props}>{children}</ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="text-sm text-slate-600 space-y-1.5 mb-4 ml-1 list-decimal list-inside" {...props}>{children}</ol>
        ),
        li: ({ children, ...props }) => (
          <li className="flex gap-2 leading-relaxed" {...props}>
            <span className="text-[#0066ff] mt-1.5 shrink-0">
              <ChevronRight className="size-3" />
            </span>
            <span className="flex-1">{children}</span>
          </li>
        ),
        code: ({ className, children, ...props }) => {
          const isBlock = className?.includes('language-')
          if (isBlock) {
            const lang = className?.replace('language-', '') ?? ''
            const codeStr = String(children).replace(/\n$/, '')
            return (
              <div className="relative group my-4">
                {lang && (
                  <div className="absolute top-0 left-0 px-3 py-1 text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-800 rounded-tl-lg rounded-br-lg">
                    {lang}
                  </div>
                )}
                <CopyButton text={codeStr} />
                <pre className="bg-[#0d1117] text-slate-300 rounded-lg p-4 pt-8 overflow-x-auto text-xs leading-relaxed font-mono border border-slate-800">
                  <code {...props}>{children}</code>
                </pre>
              </div>
            )
          }
          return (
            <code className="bg-slate-100 text-[#0066ff] px-1.5 py-0.5 rounded text-xs font-mono font-medium" {...props}>
              {children}
            </code>
          )
        },
        pre: ({ children }) => <>{children}</>,
        blockquote: ({ children, ...props }) => (
          <blockquote className="border-l-3 border-[#0066ff] bg-[#0066ff]/5 rounded-r-lg px-4 py-3 my-4 text-sm text-slate-600 [&>p]:mb-0" {...props}>
            {children}
          </blockquote>
        ),
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-4 rounded-lg border border-slate-200/60">
            <table className="w-full text-sm" {...props}>{children}</table>
          </div>
        ),
        thead: ({ children, ...props }) => (
          <thead className="bg-slate-50/80 border-b border-slate-200/60" {...props}>{children}</thead>
        ),
        th: ({ children, ...props }) => (
          <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider" {...props}>{children}</th>
        ),
        td: ({ children, ...props }) => (
          <td className="px-4 py-2.5 text-slate-600 border-t border-slate-100" {...props}>{children}</td>
        ),
        hr: () => <hr className="my-8 border-slate-200/60" />,
        img: ({ src, alt, ...props }) => (
          <img src={src} alt={alt} className="rounded-lg border border-slate-200/60 shadow-sm my-4 max-w-full" {...props} />
        ),
      }}
    >
      {content}
    </Markdown>
  )
}

// ---------------------------------------------------------------------------
// On this page (right sidebar)
// ---------------------------------------------------------------------------

function OnThisPage({ currentSlug }: { currentSlug: string }) {
  return (
    <aside className="w-56 shrink-0 overflow-y-auto hidden xl:block">
      <div className="py-8 pr-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-3">
          On this page
        </p>
        <nav className="space-y-4">
          {CATEGORIES.map((category) => (
            <div key={category.name}>
              <p className="px-3 text-xs font-bold text-slate-700 mb-1">
                {category.name}
              </p>
              <ul className="space-y-0.5">
                {category.items.map((item) => {
                  const isActive = item.slug === currentSlug
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        className={`block pl-6 pr-3 py-1 text-xs transition-all rounded ${
                          isActive
                            ? 'text-[#0066ff] font-semibold'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocSlugPage() {
  const { slug } = useParams<{ slug: string }>()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch document content
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/docs/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Document not found')
        return r.json()
      })
      .then((json) => {
        setContent(json.data.content)
        setTitle(json.data.title)
        setCategory(json.data.category)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  // Find prev/next docs
  const allDocs = CATEGORIES.flatMap((c) => c.items)
  const currentIndex = allDocs.findIndex((d) => d.slug === slug)
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null

  return (
    <div className="flex flex-col h-screen">
      <AppHeader title="Documentation" description={title || 'Docs'} />

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <DocsSidebar currentSlug={slug} searchQuery={searchQuery} onSearch={setSearchQuery} />

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto px-8 pb-12">
          <div className="max-w-4xl mx-auto py-8">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 w-64 bg-slate-200/60 rounded-lg" />
                <div className="h-4 w-full bg-slate-200/40 rounded" />
                <div className="h-4 w-5/6 bg-slate-200/40 rounded" />
                <div className="h-4 w-4/6 bg-slate-200/40 rounded" />
                <div className="h-32 w-full bg-slate-200/30 rounded-lg mt-6" />
                <div className="h-4 w-full bg-slate-200/40 rounded" />
                <div className="h-4 w-3/4 bg-slate-200/40 rounded" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
                <BookOpen className="size-8 text-red-300 mx-auto mb-3" />
                <p className="text-red-700 font-medium">{error}</p>
                <Link href="/docs/getting-started" className="text-sm text-[#0066ff] hover:underline mt-2 inline-block">
                  Go to Getting Started
                </Link>
              </div>
            ) : (
              <>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
                  <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
                  <ChevronRight className="size-3" />
                  <span className="text-slate-500">{category}</span>
                  <ChevronRight className="size-3" />
                  <span className="text-slate-700 font-medium">{title}</span>
                </div>

                {/* Markdown content */}
                <article className="docs-content">
                  <MarkdownContent content={content} />
                </article>

                {/* Prev / Next navigation */}
                <div className="flex items-stretch gap-4 mt-12 pt-8 border-t border-slate-200/60">
                  {prevDoc ? (
                    <Link
                      href={`/docs/${prevDoc.slug}`}
                      className="flex-1 group rounded-xl border border-slate-200/60 bg-white/50 hover:bg-white/80 hover:border-[#0066ff]/30 p-4 transition-all"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Previous</p>
                      <p className="text-sm font-semibold text-slate-700 group-hover:text-[#0066ff] transition-colors">
                        {prevDoc.title}
                      </p>
                    </Link>
                  ) : <div className="flex-1" />}
                  {nextDoc ? (
                    <Link
                      href={`/docs/${nextDoc.slug}`}
                      className="flex-1 group rounded-xl border border-slate-200/60 bg-white/50 hover:bg-white/80 hover:border-[#0066ff]/30 p-4 transition-all text-right"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Next</p>
                      <p className="text-sm font-semibold text-slate-700 group-hover:text-[#0066ff] transition-colors">
                        {nextDoc.title}
                      </p>
                    </Link>
                  ) : <div className="flex-1" />}
                </div>
              </>
            )}
          </div>
        </main>

        {/* Right: On this page */}
        <OnThisPage currentSlug={slug} />
      </div>
    </div>
  )
}

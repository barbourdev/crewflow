import Link from 'next/link'
import Image from 'next/image'
import { GlassCard } from './glass-card'
import type { GitHubData } from '@/lib/github'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OssSectionProps {
  github: GitHubData
}

// ---------------------------------------------------------------------------
// Exported section
// ---------------------------------------------------------------------------

export function OssSection({ github }: OssSectionProps) {
  const stats = [
    { value: github.starsFormatted, label: 'Stars' },
    { value: github.forksFormatted, label: 'Forks' },
    { value: github.contributorsFormatted, label: 'Contributors' },
  ]

  return (
    <section
      id="oss"
      className="py-32 px-6 lg:px-20 bg-[#0066ff]/5 relative overflow-hidden"
    >
      {/* Particle grid */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(0, 102, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <h2 className="text-[#0066ff] text-sm font-black uppercase tracking-[0.4em] mb-4">
          The Collective
        </h2>
        <h3 className="text-slate-900 text-5xl md:text-7xl font-black tracking-tighter mb-12">
          Open Source.
          <br />
          <span className="text-[#0066ff]">Always.</span>
        </h3>

        <GlassCard
          hover={false}
          rounded="3xl"
          className="max-w-4xl mx-auto p-12 border-white/50 mb-16"
        >
          {/* Stats row */}
          <div className="flex items-center justify-center gap-12 mb-16 flex-wrap">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-12">
                <div className="text-center">
                  <div className="text-5xl font-black text-slate-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
                {i < stats.length - 1 && (
                  <div className="w-px h-12 bg-slate-200 hidden sm:block" />
                )}
              </div>
            ))}
          </div>

          {/* Top Contributors */}
          {github.topContributors.length > 0 && (
            <div className="mb-12">
              <div className="text-sm font-bold text-slate-900 mb-8 uppercase tracking-[0.2em]">
                Our Top Contributors
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {github.topContributors.map((contributor) => (
                  <Link
                    key={contributor.login}
                    href={contributor.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${contributor.login} (${contributor.contributions} contributions)`}
                  >
                    <Image
                      src={contributor.avatarUrl}
                      alt={contributor.login}
                      width={48}
                      height={48}
                      className="size-12 rounded-full border-2 border-white shadow-sm ring-4 ring-[#0066ff]/5 hover:ring-[#0066ff]/20 transition-all"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder if no contributors fetched */}
          {github.topContributors.length === 0 && (
            <div className="mb-12">
              <div className="text-sm font-bold text-slate-900 mb-8 uppercase tracking-[0.2em]">
                Our Top Contributors
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-4 justify-items-center">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`size-12 rounded-full border-2 border-white shadow-sm ring-4 ring-[#0066ff]/5 ${
                      i % 3 === 0
                        ? 'bg-slate-200'
                        : i % 3 === 1
                          ? 'bg-slate-300'
                          : 'bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={github.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              View Repository
            </Link>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}

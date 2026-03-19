import Link from 'next/link'

const columns = [
  {
    title: 'Framework',
    links: ['Core Vision', 'The Zones', 'Roadmap'],
  },
  {
    title: 'Developers',
    links: ['Documentation', 'API Keys', 'GitHub OSS'],
  },
  {
    title: 'Collective',
    links: ['Manifesto', 'Careers', 'Privacy'],
  },
]

function SocialIcon() {
  return (
    <div className="size-10 rounded-xl bg-white/40 backdrop-blur-[20px] border border-white flex items-center justify-center text-slate-500 hover:text-[#0066ff] transition-colors cursor-pointer shadow-sm">
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
  )
}

export function LandingFooter() {
  return (
    <footer className="px-6 lg:px-20 py-24 bg-white/40 backdrop-blur-[20px] border-t border-white/50 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-20">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-8">
              <div className="size-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <h2 className="text-slate-900 font-black tracking-tighter text-xl">
                CREWFLOW
              </h2>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
              Redefining autonomous intelligence orchestration through cinematic
              design and functional precision. Built for developers by
              researchers.
            </p>
            <div className="flex gap-4">
              <SocialIcon />
              <SocialIcon />
              <SocialIcon />
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 lg:gap-32">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-6">
                <h5 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">
                  {col.title}
                </h5>
                <nav className="flex flex-col gap-4">
                  {col.links.map((link) => (
                    <Link
                      key={link}
                      href="#"
                      className="text-slate-500 text-sm font-bold hover:text-[#0066ff] transition-colors"
                    >
                      {link}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-16 mt-20 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">
          <p>&copy; 2024 CrewFlow Inc. MIT Licensed Framework.</p>
          <div className="flex gap-8">
            <span>Designed for Collective Intelligence</span>
            <span className="text-[#0066ff]">v2.0.4-LATEST</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

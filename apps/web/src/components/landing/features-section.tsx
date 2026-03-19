import { GlassCard } from './glass-card'

// ---------------------------------------------------------------------------
// Feature cards data
// ---------------------------------------------------------------------------

const features = [
  {
    icon: (
      <svg className="size-8 text-[#0066ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 3v12M18 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 9a9 9 0 01-9 9" />
      </svg>
    ),
    title: 'Hierarchical Sync',
    description:
      'Multi-layer agent communication with delegated authority protocols.',
  },
  {
    icon: (
      <svg className="size-8 text-[#0066ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Low Latency',
    description:
      'Direct-pipe token streaming for real-time agent output visualization.',
  },
]

// ---------------------------------------------------------------------------
// Vision Mode card (right side)
// ---------------------------------------------------------------------------

function VisionModeCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 bg-[#0066ff]/5 blur-3xl rounded-full" />
      <GlassCard rounded="3xl" hover={false} className="p-10 border-white shadow-2xl relative">
        <div className="space-y-6">
          {/* Vision Mode */}
          <div className="p-5 rounded-2xl bg-white/40 border border-white shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="font-black text-slate-900">Vision Mode</div>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-[#0066ff] rounded-full" />
            </div>
          </div>

          {/* Logic Flow */}
          <div className="p-5 rounded-2xl bg-white/40 border border-white shadow-sm opacity-60">
            <div className="flex items-center gap-4 mb-3">
              <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 17l6-6-6-6M12 19h8" />
                </svg>
              </div>
              <div className="font-black text-slate-900">Logic Flow</div>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full" />
          </div>

          {/* Active Stream */}
          <div className="p-8 rounded-[2rem] bg-slate-900 text-white mt-10">
            <div className="text-xs font-mono text-slate-500 mb-4 uppercase tracking-widest">
              Active Stream
            </div>
            <p className="text-lg font-bold leading-snug">
              &ldquo;Orchestrating squad objectives based on real-time market
              volatility triggers...&rdquo;
            </p>
            <div className="mt-6 flex justify-between items-center">
              <div className="flex -space-x-2">
                <div className="size-8 rounded-full border-2 border-slate-900 bg-[#0066ff]" />
                <div className="size-8 rounded-full border-2 border-slate-900 bg-blue-400" />
                <div className="size-8 rounded-full border-2 border-slate-900 bg-indigo-500" />
              </div>
              <span className="text-[10px] font-bold text-[#0066ff] px-3 py-1 rounded-full bg-[#0066ff]/10">
                3 ACTIVE AGENTS
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Exported section
// ---------------------------------------------------------------------------

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 lg:px-20 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* Left: text + feature cards */}
        <div>
          <h2 className="text-[#0066ff] text-sm font-black uppercase tracking-[0.4em] mb-4">
            Functional Framework
          </h2>
          <h3 className="text-slate-900 text-5xl md:text-6xl font-black leading-tight tracking-tighter mb-8">
            Design for the{' '}
            <span className="italic text-[#0066ff]">Technical Elite.</span>
          </h3>
          <p className="text-slate-600 text-xl leading-relaxed mb-10 max-w-xl font-medium">
            CrewFlow bridges the gap between high-level orchestration and
            granular execution. Experience a platform that feels as good as it
            performs.
          </p>
          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((f) => (
              <GlassCard
                key={f.title}
                className="p-6 border-white/50 hover:border-[#0066ff]/30"
              >
                <div className="mb-4">{f.icon}</div>
                <h4 className="font-bold text-slate-900 mb-2">{f.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {f.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right: Vision Mode */}
        <VisionModeCard />
      </div>
    </section>
  )
}

import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="py-40 px-6">
      <div className="max-w-5xl mx-auto bg-[rgba(10,15,24,0.7)] backdrop-blur-[24px] border border-white/10 rounded-[4rem] p-16 lg:p-32 text-center relative overflow-hidden shadow-2xl">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0066ff]/30 via-transparent to-[#0066ff]/10" />

        <div className="relative z-10">
          <h2 className="text-white text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9]">
            ENTER THE
            <br />
            ORCHESTRA.
          </h2>
          <p className="text-slate-300 text-xl md:text-2xl mb-12 max-w-xl mx-auto font-light italic">
            The future of work is synchronized. Experience the antigravity
            orchestration today.
          </p>
          <Link
            href="/dashboard"
            className="bg-[#0066ff] text-white text-xl font-black px-14 py-7 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,102,255,0.5)] hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter shadow-2xl inline-flex items-center justify-center"
          >
            Deploy Your First Squad
          </Link>
        </div>
      </div>
    </section>
  )
}

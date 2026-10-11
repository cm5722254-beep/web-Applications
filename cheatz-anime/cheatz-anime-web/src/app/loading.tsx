// ─────────────────────────────────────────────────────────────────────────────
// Global Loading UI — shown by Next.js App Router during route segment loads.
// Keeps the shell (Navbar, bg) visible while data fetches.
// ─────────────────────────────────────────────────────────────────────────────

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#07080f] flex flex-col">
      {/* Navbar skeleton */}
      <div className="h-16 w-full bg-[#07080f]/95 border-b border-white/6 flex items-center px-6 gap-4">
        <div className="skeleton w-9 h-9 rounded-xl" />
        <div className="skeleton w-28 h-5 rounded-lg" />
        <div className="flex-1" />
        <div className="skeleton w-8 h-8 rounded-xl" />
        <div className="skeleton w-20 h-8 rounded-xl" />
      </div>

      {/* Hero skeleton */}
      <div className="px-4 sm:px-6 pt-12 pb-16 max-w-5xl mx-auto w-full flex flex-col items-center gap-5">
        <div className="skeleton w-64 h-8 rounded-full" />
        <div className="skeleton w-80 h-14 rounded-2xl" />
        <div className="skeleton w-56 h-14 rounded-2xl" />
        <div className="skeleton w-72 h-5 rounded-lg" />
        <div className="skeleton w-56 h-5 rounded-lg" />
        <div className="flex gap-3 mt-2">
          <div className="skeleton w-36 h-12 rounded-xl" />
          <div className="skeleton w-40 h-12 rounded-xl" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-10 pb-16">
        {Array.from({ length: 2 }).map((_, s) => (
          <section key={s}>
            <div className="flex items-center justify-between mb-5">
              <div className="skeleton w-40 h-7 rounded-lg" />
              <div className="skeleton w-16 h-5 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-[#0d0f1a] border border-white/5">
                  <div className="skeleton aspect-[2/3] w-full rounded-none" />
                  <div className="p-2.5 space-y-2">
                    <div className="skeleton h-3 w-4/5 rounded" />
                    <div className="skeleton h-2.5 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

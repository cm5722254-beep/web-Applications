'use client'

import { useState, useEffect, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { animeService } from '@/services/api'
import { AnimeCard } from '@/components/ui/AnimeCard'
import { AnimeCardSkeleton, LoadingSpinner } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [debounced, setDebounced] = useState(query)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query)
      if (query.trim()) {
        router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false })
      }
    }, 380)
    return () => clearTimeout(t)
  }, [query, router])

  const { data, isLoading } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => animeService.search(debounced),
    enabled: debounced.length >= 1,
    staleTime: 30_000,
  })

  const results = data?.data ?? []
  const total = data?.meta?.total ?? 0

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search donghua, anime, movies... (Khmer or English)"
              className="w-full bg-[#0e111f] border border-white/10 hover:border-cyan-500/30 focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 rounded-2xl pl-12 pr-10 py-4 text-white placeholder-neutral-500 text-sm transition-all shadow-lg"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* Trending suggestions */}
          {!query && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Tales of Herding Gods', 'Soul Land', 'Dragon Master', 'Against the Gods', 'Battle Through Heavens'].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="text-xs bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-neutral-300 hover:text-cyan-300 px-3 py-1.5 rounded-xl transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {!debounced ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-30">🔍</div>
            <h2 className="text-xl font-bold text-white mb-2">Search the Catalog</h2>
            <p className="text-neutral-400 text-sm">Type a title to find donghua, anime, or movies</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-30">😕</div>
            <h3 className="text-white font-bold text-lg mb-1">No results for &ldquo;{debounced}&rdquo;</h3>
            <p className="text-neutral-400 text-sm">Try a different title or browse by genre</p>
          </div>
        ) : (
          <>
            <p className="text-neutral-400 text-sm mb-5">
              Found <span className="text-white font-bold">{total}</span> result{total !== 1 ? 's' : ''} for{' '}
              <span className="text-cyan-400 font-bold">&ldquo;{debounced}&rdquo;</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080f] flex items-center justify-center">
          <LoadingSpinner size={44} />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}

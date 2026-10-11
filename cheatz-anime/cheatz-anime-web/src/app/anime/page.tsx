'use client'

import { useState, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { Filter, ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { animeService, genreService } from '@/services/api'
import { AnimeCard } from '@/components/ui/AnimeCard'
import { AnimeCardSkeleton, EmptyState, ErrorMessage, LoadingSpinner } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const TYPE_OPTIONS = [
  { value: '', label: 'All Series' },
  { value: 'donghua', label: 'Chinese Donghua' },
  { value: 'anime', label: 'Japanese Anime' },
  { value: 'movie', label: 'Movies & Specials' },
  { value: 'cartoon', label: '2D Animation' },
]

const SORT_OPTIONS = [
  { value: 'latest', label: 'Recently Updated' },
  { value: 'views', label: 'Most Viewed' },
]

const TYPE_TITLES: Record<string, string> = {
  donghua: 'Chinese Donghua Series',
  movie: 'Anime & Donghua Movies',
  anime: 'Japanese Anime Series',
  cartoon: '2D Animated Series',
}

function AnimeCatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = useState(1)
  const type = searchParams.get('type') || ''
  const genre = searchParams.get('genre') || undefined
  const sort = searchParams.get('sort') || 'latest'

  const { data: genres } = useQuery({ queryKey: ['genres'], queryFn: genreService.list })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['anime', 'catalog', type, genre, sort, page],
    queryFn: () => animeService.list({ type: type || undefined, genre, sort, page, per_page: 24 }),
  })

  const title = type ? TYPE_TITLES[type] || 'Anime Catalog' : genre ? `${genre} Anime & Donghua` : 'Complete Anime Catalog'

  return (
    <div className="min-h-screen bg-[#0a0608] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {title}
            </h1>
            {data && (
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                Showing {data.data.length} of {data.meta.total} titles indexed
              </p>
            )}
          </div>
        </div>

        {/* Type Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                if (opt.value) params.set('type', opt.value)
                else params.delete('type')
                params.delete('page')
                router.push(`?${params.toString()}`)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border ${
                type === opt.value
                  ? 'bg-red-600 text-black border-red-400 shadow-[0_0_20px_rgba(225,29,72,0.4)]'
                  : 'bg-[#130a0b] text-neutral-300 border-white/5 hover:border-red-500/35 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sub-filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-[#130a0b] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold">
            <Filter size={15} className="text-red-400" />
            <span>Filter:</span>
          </div>

          {/* Genre filter */}
          <select
            value={genre || ''}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString())
              if (e.target.value) params.set('genre', e.target.value)
              else params.delete('genre')
              router.push(`?${params.toString()}`)
            }}
            className="bg-black/60 border border-white/10 text-neutral-200 text-xs rounded-xl px-3 py-2 focus:border-red-400 focus:outline-none"
          >
            <option value="">All Genres</option>
            {genres?.map((g) => (
              <option key={g.id} value={g.slug || g.name_en}>
                {g.name_en}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('sort', e.target.value)
              router.push(`?${params.toString()}`)
              setPage(1)
            }}
            className="bg-black/60 border border-white/10 text-neutral-200 text-xs rounded-xl px-3 py-2 focus:border-red-400 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        {isError ? (
          <ErrorMessage
            message="Unable to load catalog. Please check your internet connection."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <EmptyState
            title="No series found"
            description="Try choosing a different genre or clearing the current filters."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data?.data.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>

            {/* Pagination */}
            {data && data.meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white disabled:opacity-30 transition-colors px-4 py-2 border border-white/10 rounded-xl hover:border-red-400"
                >
                  <ChevronLeft size={16} /> <span>Previous</span>
                </button>
                <span className="text-neutral-400 text-xs font-semibold">
                  Page {page} of {data.meta.last_page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.meta.last_page, p + 1))}
                  disabled={page === data.meta.last_page}
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white disabled:opacity-30 transition-colors px-4 py-2 border border-white/10 rounded-xl hover:border-red-400"
                >
                  <span>Next</span> <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function AnimeCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0608] flex items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      }
    >
      <AnimeCatalogContent />
    </Suspense>
  )
}

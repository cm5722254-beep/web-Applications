'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { animeService } from '@/services/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AnimeCard } from '@/components/ui/AnimeCard'
import { LoadingSpinner, ErrorMessage } from '@/components/ui'
import { Film, Search, Flame } from 'lucide-react'
import Link from 'next/link'
import type { AnimeListItem } from '@/types'

const GENRE_FILTERS = [
  { id: 'all', label: 'All Movies' },
  { id: 'Action', label: 'Action' },
  { id: 'Fantasy', label: 'Fantasy' },
  { id: 'Adventure', label: 'Adventure' },
  { id: 'Martial Arts', label: 'Martial Arts' },
  { id: 'Animation', label: '3D Donghua' },
]

export default function MoviesPage() {
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'rating'>('popular')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(96)

  // Query movies from API
  const { data, isLoading, isError } = useQuery({
    queryKey: ['movies-list', page, perPage],
    queryFn: () => animeService.list({ type: 'movie', per_page: perPage, page }),
    staleTime: 5 * 60 * 1000,
  })

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    let list: AnimeListItem[] = data?.data || []

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (m) =>
          m.title_en.toLowerCase().includes(q) ||
          (m.title_original && m.title_original.toLowerCase().includes(q))
      )
    }

    if (selectedGenre !== 'all') {
      list = list.filter((m) =>
        m.genres?.some((g) => g.name_en.toLowerCase().includes(selectedGenre.toLowerCase()))
      )
    }

    if (sortBy === 'popular') {
      list = [...list].sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (Number(b.average_score) || 0) - (Number(a.average_score) || 0))
    } else if (sortBy === 'latest') {
      list = [...list].sort((a, b) => (b.release_year || 0) - (a.release_year || 0))
    }

    return list
  }, [data?.data, searchQuery, selectedGenre, sortBy])

  // Featured top movie for banner
  const featuredMovie = data?.data?.[0]

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 w-full">
        {/* Hero Banner for Movies */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-black border border-cyan-500/18 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/18 border border-cyan-500/35 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Film size={14} /> Theatrical Cinema & Specials
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                Anime & Donghua <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Movies</span>
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                Feature-length theatrical anime movies, 3D Donghua special editions, and full cinematic films in 4K & Full HD.
              </p>
            </div>

            {/* Featured Poster Preview */}
            {featuredMovie && (
              <div className="shrink-0 w-44 sm:w-56 group">
                <Link
                  href={`/anime/${featuredMovie.slug}`}
                  className="block relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform group-hover:scale-105"
                >
                  <img
                    src={featuredMovie.poster_url || ''}
                    alt={featuredMovie.title_en}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    <span className="text-[10px] bg-cyan-600 text-black font-black px-2 py-0.5 rounded w-max mb-1 uppercase">
                      Featured Film
                    </span>
                    <p className="text-xs font-bold text-white line-clamp-1">
                      {featuredMovie.title_en}
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Filter and Search Bar */}
        <div className="bg-[#0d0f1a] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movie titles..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-red-400"
              />
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-neutral-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
              >
                <option value="popular">Most Popular</option>
                <option value="latest">Latest Release</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Genre Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {GENRE_FILTERS.map((g) => {
              const active = selectedGenre === g.id
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenre(g.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-cyan-600 text-black shadow-md shadow-cyan-500/30'
                      : 'bg-black/30 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {g.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Movies Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame size={20} className="text-cyan-400" />
              <span>Available Movies ({filteredMovies.length})</span>
            </h2>
            {data && (
              <p className="text-neutral-400 text-xs">
                Showing {data.data.length} of {data.meta?.total || 0} total
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size={40} />
            </div>
          ) : isError ? (
            <ErrorMessage message="Unable to load movies. Please try again." />
          ) : filteredMovies.length === 0 ? (
            <div className="text-center py-16 bg-[#0d0f1a] border border-white/5 rounded-2xl p-8">
              <Film size={48} className="text-neutral-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No movies found</h3>
              <p className="text-xs text-neutral-400">Try searching with a different keyword or genre.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
                {filteredMovies.map((movie) => (
                  <AnimeCard key={movie.id} anime={movie} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.meta && data.meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0d0f1a] border border-white/10 text-neutral-300 hover:text-white hover:border-cyan-500/50 disabled:opacity-30 transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-neutral-400 text-xs font-semibold">
                    Page {page} of {data.meta.last_page}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(data.meta.last_page, p + 1))}
                    disabled={page === data.meta.last_page}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0d0f1a] border border-white/10 text-neutral-300 hover:text-white hover:border-cyan-500/50 disabled:opacity-30 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

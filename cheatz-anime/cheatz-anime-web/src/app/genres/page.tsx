'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { genreService } from '@/services/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui'
import { Compass, Sparkles, Film, ArrowRight } from 'lucide-react'

export default function GenresPage() {
  const { data: genres, isLoading } = useQuery({
    queryKey: ['genres', 'full'],
    queryFn: genreService.list,
  })

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-purple-950/40 border border-cyan-500/20 p-8 sm:p-10 mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Compass size={13} />
              <span>Full Genre Classification</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Explore by <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Genre</span>
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base mt-2">
              Browse Donghua and Anime by official categories, cultivation styles, themes, and martial arts tags.
            </p>
          </div>
        </div>

        {/* Genres Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner size={44} />
            <p className="text-neutral-400 text-sm">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(genres || []).map((genre) => (
              <Link
                key={genre.id}
                href={`/anime?genre=${encodeURIComponent(genre.name_en)}`}
                className="group relative bg-[#0e111f] border border-white/5 hover:border-cyan-500/50 rounded-2xl p-4 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 flex items-center justify-between overflow-hidden hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 transition-all">
                    <span>{genre.icon || '🏷️'}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {genre.name_en}
                    </h3>
                    <span className="text-[10px] text-neutral-500">Explore Anime</span>
                  </div>
                </div>

                <ArrowRight
                  size={15}
                  className="text-neutral-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
                />
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

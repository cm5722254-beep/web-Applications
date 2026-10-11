'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import catalog from '@/data/animekill_catalog.json'
import { Flame, Star, Play } from 'lucide-react'

export default function PopularAnimePage() {
  const animesMap = (catalog.animes || {}) as Record<string, any>
  // Convert map to array and sort
  const popularList = Object.values(animesMap)

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-brand-text">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Flame size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Most Popular & Trending Series
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                Top rated anime with highest view counts and community popularity
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/18 border border-red-500/25 text-red-300">
            {popularList.length} Trending Series
          </span>
        </div>

        {/* Grid of Popular Anime */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {popularList.slice(0, 48).map((anime, index) => {
            const watchUrl = `/anime/${anime.slug}`
            const poster = anime.poster || `https://animekill.com/poster/${anime.slug}-hd.webp`

            return (
              <Link
                key={anime.slug}
                href={watchUrl}
                className="group relative flex flex-col rounded-xl overflow-hidden bg-brand-surface border border-brand-border hover:border-brand-violet/50 hover:shadow-xl hover:shadow-brand-violet/10 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Poster */}
                <div className="relative aspect-[3/4] w-full bg-black/40 overflow-hidden">
                  <img
                    src={poster}
                    alt={anime.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = 'https://animekill.com/poster/tales-of-herding-gods-hd.webp'
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Rank Badge */}
                  <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-md bg-black/70 backdrop-blur-md text-amber-400 font-extrabold text-xs flex items-center justify-center border border-amber-400/30 shadow-md">
                    #{index + 1}
                  </div>

                  {/* Score Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-400 text-xs font-semibold flex items-center gap-1 border border-white/10">
                    <Star size={11} className="fill-amber-400" />
                    <span>{anime.score || '8.8'}</span>
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-brand-violet/90 text-white flex items-center justify-center shadow-lg shadow-brand-violet/40 transform scale-75 group-hover:scale-100 transition-transform">
                      <Play size={20} className="fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 text-brand-text group-hover:text-brand-glow transition-colors">
                      {anime.title_km || anime.title}
                    </h3>
                    {anime.title_km && (
                      <p className="text-[11px] text-brand-muted truncate mt-0.5">
                        {anime.title}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-brand-muted">
                    <span className="capitalize text-brand-glow">{anime.type || 'Donghua'}</span>
                    <span>{anime.total_episodes || 24} ភាគ</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}

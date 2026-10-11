'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import catalog from '@/data/animekill_catalog.json'
import { Play, Sparkles } from 'lucide-react'

export default function LatestReleasesPage() {
  const latestList = catalog.latest || []

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-brand-text">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-violet/20 text-brand-glow border border-brand-violet/30">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Latest Released Episodes
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                Freshly broadcasted episodes of Chinese Donghua, Anime, and special releases
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-500/18 border border-cyan-500/35 text-cyan-300">
              {latestList.length} Recent Episodes
            </span>
          </div>
        </div>

        {/* Grid of Latest Releases */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {latestList.map((item) => {
            const watchUrl = `/anime/${item.animeSlug}/season-1/ep-${item.epNum}`
            const poster = item.poster || `https://animekill.com/poster/${item.animeSlug}-hd.webp`

            return (
              <Link
                key={item.epSlug}
                href={watchUrl}
                className="group relative flex flex-col rounded-xl overflow-hidden bg-brand-surface border border-brand-border hover:border-brand-violet/50 hover:shadow-xl hover:shadow-brand-violet/10 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[3/4] w-full bg-black/40 overflow-hidden">
                  <img
                    src={poster}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback poster
                      ;(e.target as HTMLImageElement).src = 'https://animekill.com/poster/tales-of-herding-gods-hd.webp'
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Episode Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-brand-violet/90 backdrop-blur-md text-white text-xs font-bold shadow-md">
                    Ep {item.epNum}
                  </div>

                  {/* Play Hover Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-brand-violet/90 text-white flex items-center justify-center shadow-lg shadow-brand-violet/40 transform scale-75 group-hover:scale-100 transition-transform">
                      <Play size={20} className="fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 text-brand-text group-hover:text-brand-glow transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-brand-muted">
                    <span className="font-medium text-brand-glow">ភាគ {item.epNum}</span>
                    <span className="capitalize">HD 1080p</span>
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

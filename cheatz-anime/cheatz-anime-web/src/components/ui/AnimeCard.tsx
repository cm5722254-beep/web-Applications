'use client'

import Link from 'next/link'
import { Play, Star, Clock, Film } from 'lucide-react'
import type { AnimeListItem } from '@/types'

interface AnimeCardProps {
  anime: any
  priority?: boolean
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const poster =
    anime.poster ||
    anime.cover ||
    anime.thumbnail ||
    '/logo.png'

  const title = anime.title || anime.name || 'Unknown Title'
  const slug  = anime.slug  || anime.id?.toString() || 'unknown'
  const eps   = anime.total_episodes ?? anime.episodes ?? null
  const score = anime.score  ?? anime.rating ?? null
  const type  = anime.type   ?? anime.anime_type ?? null

  return (
    <Link href={`/anime/${slug}`} className="group block">
      <div className="anime-card h-full">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-[#0d0f1a]">
          <img
            src={poster}
            alt={title}
            loading={priority ? 'eager' : 'lazy'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            onError={(e) => {
              const t = e.target as HTMLImageElement
              t.onerror = null
              t.src = '/logo.png'
            }}
          />

          {/* Overlay */}
          <div className="card-overlay" />

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="w-12 h-12 rounded-full bg-cyan-500/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_25px_rgba(0,212,255,0.6)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play size={20} className="text-white fill-white translate-x-0.5" />
            </div>
          </div>

          {/* Type badge */}
          {type && (
            <div className="absolute top-2 left-2 z-10">
              <span className="tag tag-cyan text-[9px]">{type}</span>
            </div>
          )}

          {/* Score badge */}
          {score && (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
              <Star size={9} className="fill-yellow-400" />
              {typeof score === 'number' ? score.toFixed(1) : score}
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <h3 className="text-white text-xs font-bold leading-tight line-clamp-2 mb-1.5 group-hover:text-cyan-200 transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
              {eps && (
                <span className="flex items-center gap-1">
                  <Film size={9} />
                  {eps} eps
                </span>
              )}
              {anime.status && (
                <span className={`font-semibold ${
                  anime.status === 'ongoing' || anime.status === 'airing'
                    ? 'text-cyan-400'
                    : 'text-neutral-500'
                }`}>
                  {anime.status === 'ongoing' || anime.status === 'airing'
                    ? '● Ongoing'
                    : 'Completed'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Skeleton placeholder ─────────────────────────────────────────────── */
export function AnimeCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#0d0f1a] border border-white/5">
      <div className="skeleton aspect-[2/3]" />
      <div className="p-2.5 space-y-2">
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-2.5 w-1/2 rounded" />
      </div>
    </div>
  )
}

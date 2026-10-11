'use client'

import Link from 'next/link'
import { Crown, Play, Lock, Star } from 'lucide-react'
import type { AnimeListItem } from '@/types'
import { cn } from '@/lib/utils'

interface AnimeCardProps {
  anime: AnimeListItem
  size?: 'sm' | 'md' | 'lg'
  requireAuth?: boolean
}

const POSTER_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%2307080f'/%3E%3Ctext x='150' y='225' text-anchor='middle' dominant-baseline='middle' font-size='32' fill='%2306b6d4'%3ESC-ANIME%3C/text%3E%3C/svg%3E"

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  donghua: { label: 'Donghua', color: 'bg-cyan-500/90 text-black' },
  anime: { label: 'Anime', color: 'bg-blue-600/90 text-white' },
  movie: { label: 'Movie', color: 'bg-purple-600/90 text-white' },
  cartoon: { label: '2D Cartoon', color: 'bg-emerald-600/90 text-white' },
  ova: { label: 'OVA', color: 'bg-sky-600/90 text-white' },
  ona: { label: 'ONA', color: 'bg-sky-600/90 text-white' },
  special: { label: 'Special', color: 'bg-amber-500/90 text-black' },
  tv: { label: 'TV Series', color: 'bg-blue-600/90 text-white' },
}

export function AnimeCard({ anime, requireAuth = false }: AnimeCardProps) {
  const href = `/anime/${anime.slug}`
  const typeInfo = TYPE_LABELS[anime.type] || {
    label: (anime.type || 'Donghua').toUpperCase(),
    color: 'bg-cyan-500/90 text-black',
  }

  return (
    <Link href={href} className="block group">
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden bg-[#0d0f1a] border border-white/5',
          'transition-all duration-300 group-hover:scale-[1.03] group-hover:border-cyan-500/50',
          'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] flex flex-col h-full'
        )}
      >
        {/* Poster */}
        <div className="relative overflow-hidden aspect-[2/3] bg-neutral-900">
          <img
            src={anime.poster_url || POSTER_PLACEHOLDER}
            alt={anime.title_en}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = POSTER_PLACEHOLDER
            }}
          />

          {/* Lock overlay for guests */}
          {requireAuth && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-cyan-500 rounded-full p-3 text-black shadow-lg">
                <Lock size={20} />
              </div>
              <span className="text-white text-xs font-semibold bg-black/70 px-3 py-1 rounded-full border border-white/10">
                Sign In to Watch
              </span>
            </div>
          )}

          {/* Hover play overlay */}
          {!requireAuth && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)] transform scale-90 group-hover:scale-100 transition-transform">
                <Play size={20} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
          )}

          {/* Type + Premium badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {anime.is_premium && (
              <span className="flex items-center gap-1 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow">
                <Crown size={10} /> VIP
              </span>
            )}
            <span
              className={cn(
                'text-[10px] px-2 py-0.5 rounded font-black tracking-wide uppercase shadow',
                typeInfo.color
              )}
            >
              {typeInfo.label}
            </span>
          </div>

          {/* Airing status */}
          <div className="absolute top-2 right-2 z-10">
            {anime.airing_status === 'ongoing' ? (
              <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                <span>Ongoing</span>
              </span>
            ) : (
              <span className="bg-neutral-800/90 text-neutral-300 border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                Complete
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-white text-xs sm:text-sm font-bold leading-snug line-clamp-2 mb-1 group-hover:text-cyan-400 transition-colors">
              {anime.title_en}
            </h3>
            {anime.title_original && anime.title_original !== anime.title_en && (
              <p className="text-neutral-500 text-[11px] line-clamp-1">
                {anime.title_original}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[11px]">
            <span className="text-neutral-400">{anime.release_year || '2024'}</span>
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              <Star size={11} fill="currentColor" />
              <span>{Number(anime.average_score ?? 8.8).toFixed(1)}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

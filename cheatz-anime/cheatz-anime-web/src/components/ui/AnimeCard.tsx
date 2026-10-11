'use client'

// ─────────────────────────────────────────────────────────────────────────────
// AnimeCard — senior-level upgrade.
// • Uses next/image for automatic WebP/AVIF conversion, lazy loading, and LCP
//   optimisation (priority prop for above-the-fold cards).
// • Falls back to <img> for external URLs that can't be proxied by next/image
//   (catch-all pattern is configured in next.config.js).
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'
import { Play, Star, Film } from 'lucide-react'
import type { AnimeCardData } from '@/types'
import { cn } from '@/lib/utils'

interface AnimeCardProps {
  anime: AnimeCardData & {
    // Accept loose fields from raw API responses too
    poster?:        string | null
    cover?:         string | null
    thumbnail?:     string | null
    small_poster?:  string | null
    large_poster?:  string | null
    title?:         string | null
    name?:          string | null
    anime_id?:      string | null
    score?:         number | string | null
    rating?:        number | string | null
    airing_status?: string | null
    status?:        string | null
    episodes?:      number | null
    anime_type?:    string | null
    type?:          string | null
  }
  /** Mark as high-priority (LCP image) for above-the-fold cards */
  priority?: boolean
  className?: string
}

// ── Field normalisation helpers ──────────────────────────────────────────────

function resolvePoster(anime: AnimeCardProps['anime']): string {
  return (
    anime.poster_url ||
    anime.poster     ||
    anime.cover      ||
    anime.thumbnail  ||
    anime.small_poster ||
    anime.large_poster ||
    '/logo.png'
  )
}

function resolveTitle(anime: AnimeCardProps['anime']): string {
  return (
    anime.title_en ||
    (anime as any).title   ||
    (anime as any).name    ||
    'Unknown Title'
  )
}

function resolveSlug(anime: AnimeCardProps['anime']): string {
  return (
    anime.slug ||
    (anime as any).anime_id ||
    anime.id?.toString() ||
    'unknown'
  )
}

function resolveScore(anime: AnimeCardProps['anime']): string | null {
  const raw = anime.average_score ?? (anime as any).score ?? (anime as any).rating ?? null
  if (raw == null) return null
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw))
  return isNaN(n) ? null : n.toFixed(1)
}

function resolveType(anime: AnimeCardProps['anime']): string | null {
  return anime.type ?? (anime as any).anime_type ?? null
}

function resolveEpisodeCount(anime: AnimeCardProps['anime']): number | null {
  return anime.total_episodes ?? (anime as any).episodes ?? null
}

function resolveIsOngoing(anime: AnimeCardProps['anime']): boolean {
  const s = (anime.airing_status ?? (anime as any).status ?? '') as string
  return s === 'ongoing' || s === 'airing' || s === 'Ongoing'
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AnimeCard({ anime, priority = false, className }: AnimeCardProps) {
  const poster       = resolvePoster(anime)
  const title        = resolveTitle(anime)
  const slug         = resolveSlug(anime)
  const score        = resolveScore(anime)
  const type         = resolveType(anime)
  const eps          = resolveEpisodeCount(anime)
  const isOngoing    = resolveIsOngoing(anime)
  const airingStatus = anime.airing_status ?? (anime as any).status ?? null

  // Use next/image when we can (all https: sources are allowed via next.config.js)
  // Skip next/image for data: URIs
  const useNextImage = poster.startsWith('http')

  return (
    <Link href={`/anime/${slug}`} className={cn('group block', className)}>
      <div className="anime-card h-full">
        {/* ── Poster ──────────────────────────────────────────────────── */}
        <div className="relative aspect-[2/3] overflow-hidden bg-[#0d0f1a]">
          {useNextImage ? (
            <Image
              src={poster}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              onError={(e) => {
                // Swap broken image for fallback logo
                const img = e.currentTarget as HTMLImageElement
                img.src = '/logo.png'
              }}
            />
          ) : (
            <img
              src={poster}
              alt={title}
              loading={priority ? 'eager' : 'lazy'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
              onError={(e) => {
                const t = e.target as HTMLImageElement
                t.onerror = null
                t.src = '/logo.png'
              }}
            />
          )}

          {/* Overlay */}
          <div className="card-overlay" />

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="w-12 h-12 rounded-full bg-cyan-500/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_25px_rgba(0,212,255,0.6)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play size={20} className="text-white fill-white translate-x-0.5" aria-hidden />
            </div>
          </div>

          {/* Type badge — top-left */}
          {type && (
            <div className="absolute top-2 left-2 z-10">
              <span className="tag tag-cyan text-[9px]">{type}</span>
            </div>
          )}

          {/* Score badge — top-right */}
          {score && (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
              <Star size={9} className="fill-yellow-400" aria-hidden />
              {score}
            </div>
          )}

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <h3 className="text-white text-xs font-bold leading-tight line-clamp-2 mb-1.5 group-hover:text-cyan-200 transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
              {eps != null && (
                <span className="flex items-center gap-1">
                  <Film size={9} aria-hidden />
                  {eps} eps
                </span>
              )}
              {airingStatus && (
                <span
                  className={cn(
                    'font-semibold',
                    isOngoing ? 'text-cyan-400' : 'text-neutral-500',
                  )}
                >
                  {isOngoing ? '● Ongoing' : 'Completed'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Skeleton placeholder ───────────────────────────────────────────────── */
export function AnimeCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-[#0d0f1a] border border-white/5"
      aria-hidden="true"
    >
      <div className="skeleton aspect-[2/3]" />
      <div className="p-2.5 space-y-2">
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-2.5 w-1/2 rounded" />
      </div>
    </div>
  )
}

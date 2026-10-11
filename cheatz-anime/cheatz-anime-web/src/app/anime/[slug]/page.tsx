'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Play,
  Heart,
  Star,
  Crown,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Sparkles,
  ArrowLeft,
  Share2,
} from 'lucide-react'
import { animeService, favoritesService } from '@/services/api'
import { LoadingSpinner, ErrorMessage, Badge } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'

export default function AnimeDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null)

  const { data: anime, isLoading, isError } = useQuery({
    queryKey: ['anime', slug],
    queryFn: () => animeService.get(slug),
    enabled: !!slug,
  })

  const { mutate: toggleFavorite, isPending: favoriting } = useMutation({
    mutationFn: async () => {
      if (!user) {
        router.push(`/login?redirect=/anime/${slug}`)
        return
      }
      await favoritesService.add(anime!.id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['anime', slug] }),
  })

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0608] flex items-center justify-center">
        <LoadingSpinner size={44} />
      </div>
    )
  }

  if (isError || !anime) {
    return (
      <div className="min-h-screen bg-[#0a0608] text-white flex flex-col">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 flex-1">
          <ErrorMessage message="Anime series not found or failed to load." />
        </div>
        <Footer />
      </div>
    )
  }

  const activeSeasonId = expandedSeason ?? (anime.seasons?.[0]?.id ?? 1)
  const firstSeason = anime.seasons?.[0]
  const firstEpisodeSlug = firstSeason?.episodes?.[0]?.slug || 'ep-1'
  const watchHref = `/anime/${slug}/${firstSeason?.slug || 'season-1'}/${firstEpisodeSlug}`

  return (
    <div className="min-h-screen bg-[#0a0608] text-white flex flex-col">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={anime.banner_url || anime.poster_url || ''}
          alt={anime.title_en}
          className="w-full h-full object-cover filter blur-sm scale-105 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0608] via-[#0a0608]/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-44 md:-mt-64 relative z-10 flex-1 w-full pb-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster Card */}
          <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            <div className="rounded-3xl overflow-hidden border-2 border-red-500/25 shadow-[0_0_35px_rgba(225,29,72,0.25)] bg-[#1a0a0b] relative group">
              <img
                src={anime.poster_url || ''}
                alt={anime.title_en}
                className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%2307080f'/%3E%3C/svg%3E"
                }}
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-red-600 text-black shadow-md">
                  {anime.type || 'Donghua'}
                </span>
              </div>
            </div>

            {/* Quick Watch & Favorite */}
            <div className="mt-4 flex flex-col gap-2.5">
              <Link
                href={watchHref}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-black font-extrabold py-3.5 px-6 rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all hover:scale-105"
              >
                <Play size={18} fill="currentColor" />
                <span>Watch Episode 1</span>
              </Link>

              <button
                onClick={() => toggleFavorite()}
                disabled={favoriting}
                className="w-full flex items-center justify-center gap-2 bg-[#130a0b] hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white py-3 px-6 rounded-2xl transition-all"
              >
                <Heart size={16} />
                <span>Save to Favorites</span>
              </button>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/18 text-red-300 border border-red-500/25">
                  {anime.airing_status === 'ongoing' ? 'Ongoing Broadcast' : 'Completed'}
                </span>
                {anime.release_year && (
                  <span className="text-xs font-semibold text-neutral-400">
                    {anime.release_year}
                  </span>
                )}
                {anime.average_score && (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    <span>{Number(anime.average_score).toFixed(1)}</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {anime.title_en}
              </h1>

              {anime.title_original && (
                <p className="text-neutral-400 text-sm italic">{anime.title_original}</p>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {anime.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/anime?genre=${encodeURIComponent(g.name_en)}`}
                    className="text-xs font-semibold bg-[#130a0b] border border-white/10 hover:border-red-400/45 text-neutral-300 hover:text-red-300 px-3 py-1 rounded-xl transition-all"
                  >
                    <span>{g.icon || 'ðŸ·ï¸'}</span>
                    <span className="ml-1.5">{g.name_en}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis_en && (
              <div className="mt-6 bg-[#130a0b]/80 border border-white/5 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                  Synopsis & Overview
                </h3>
                <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
                  {anime.synopsis_en}
                </p>
              </div>
            )}

            {/* Seasons & Episodes Section */}
            {anime.seasons && anime.seasons.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Available Episodes</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/18 text-red-300 font-bold">
                      {anime.seasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0)} Total
                    </span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {anime.seasons.map((season) => {
                    const isExpanded = activeSeasonId === season.id
                    const epCount = season.episodes?.length || 0

                    return (
                      <div
                        key={season.id}
                        className="bg-[#130a0b] border border-white/10 rounded-2xl overflow-hidden shadow-lg"
                      >
                        <button
                          className="w-full flex items-center justify-between px-6 py-4 text-white hover:bg-white/5 transition-colors"
                          onClick={() => setExpandedSeason(isExpanded ? -1 : season.id)}
                        >
                          <span className="font-bold text-base">
                            {season.title_en || `Season ${season.season_number}`}
                          </span>
                          <div className="flex items-center gap-3 text-neutral-400 text-xs">
                            <span>{epCount} Episodes</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-white/5 p-5 bg-black/30">
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
                              {season.episodes?.map((ep) => (
                                <Link
                                  key={ep.id}
                                  href={`/anime/${slug}/${season.slug}/${ep.slug}`}
                                  className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#1a0a0b] hover:bg-red-600 text-neutral-300 hover:text-black border border-white/5 hover:border-red-400 transition-all duration-200 hover:scale-105 shadow-md"
                                >
                                  <span className="text-[10px] text-neutral-500 group-hover:text-black/70 font-semibold">
                                    EP
                                  </span>
                                  <span className="text-sm font-black">
                                    {ep.episode_number}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
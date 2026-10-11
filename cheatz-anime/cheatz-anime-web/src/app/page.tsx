'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Play,
  ChevronRight,
  Crown,
  Star,
  TrendingUp,
  Clock,
  Film,
  Calendar,
  Sparkles,
  Flame,
  Compass,
  ArrowRight,
} from 'lucide-react'
import { animeService, genreService, scheduleService } from '@/services/api'
import { AnimeCard } from '@/components/ui/AnimeCard'
import { AnimeCardSkeleton, EmptyState, Section } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { user } = useAuth()
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  const { data: trending, isLoading: loadingTrending } = useQuery({
    queryKey: ['anime', 'trending'],
    queryFn: () => animeService.list({ sort: 'views', per_page: 8 }),
  })

  const { data: latest, isLoading: loadingLatest } = useQuery({
    queryKey: ['anime', 'latest'],
    queryFn: () => animeService.list({ sort: 'latest', per_page: 8 }),
  })

  const { data: donghua, isLoading: loadingDonghua } = useQuery({
    queryKey: ['anime', 'donghua'],
    queryFn: () => animeService.list({ type: 'donghua', per_page: 8 }),
  })

  const { data: animeJapanese, isLoading: loadingJapanese } = useQuery({
    queryKey: ['anime', 'japanese'],
    queryFn: () => animeService.list({ type: 'anime', per_page: 8 }),
  })

  const { data: movies, isLoading: loadingMovies } = useQuery({
    queryKey: ['anime', 'movies'],
    queryFn: () => animeService.list({ type: 'movie', per_page: 8 }),
  })

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: genreService.list,
  })

  const { data: schedule } = useQuery({
    queryKey: ['schedule', 'today'],
    queryFn: scheduleService.getWeeklySchedule,
  })

  const todayAiring = schedule?.[todayName] || []

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      {/* Hero Section with Cyber Neon Aesthetic */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-full px-5 py-2 mb-6 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
            <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-cyan-400">
              <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">
              Official Production Platform • 4K HDR
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-5 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.5)]">
              SC-ANIME
            </span>
            <span className="text-white ml-3">KH</span>
          </h1>

          <p className="text-neutral-400 text-base sm:text-lg md:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Unlimited streaming of Chinese Donghua, Japanese Anime, and Movies. Instant loading with high-speed video servers and zero buffering.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/anime/tales-of-herding-gods/season-1/ep-1"
              className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold px-8 py-3.5 rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)] text-sm"
            >
              <Play size={18} fill="currentColor" />
              <span>Watch Now (Tales of Herding Gods)</span>
            </Link>

            <Link
              href="/schedule"
              className="flex items-center gap-2 bg-[#0d101c] hover:bg-white/10 border border-cyan-500/30 hover:border-cyan-400 text-white font-bold px-6 py-3.5 rounded-2xl transition-all duration-300 hover:scale-105 text-sm"
            >
              <Calendar size={18} className="text-amber-400" />
              <span>Broadcast Schedule</span>
            </Link>

            <Link
              href="/genres"
              className="flex items-center gap-2 bg-[#0d101c] hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-neutral-300 font-bold px-6 py-3.5 rounded-2xl transition-all duration-300 hover:scale-105 text-sm"
            >
              <Compass size={18} className="text-cyan-400" />
              <span>Browse Genres</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Today's Airing Schedule Banner Widget */}
      {todayAiring.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 w-full">
          <div className="bg-gradient-to-r from-cyan-950/30 via-[#0c0e18] to-blue-950/30 border border-cyan-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Airing Today ({todayName})</span>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </h3>
                  <span className="text-xs text-neutral-400">Fresh updates scheduled for broadcast</span>
                </div>
              </div>

              <Link
                href="/schedule"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group"
              >
                <span>Full Weekly Schedule</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {todayAiring.slice(0, 6).map((item, idx) => (
                <Link
                  key={`${item.anime_id}-${idx}`}
                  href={`/anime/${item.anime_id}/season-1/ep-${item.episode_number || 1}`}
                  className="group relative bg-black/40 border border-white/5 hover:border-cyan-500/40 rounded-xl overflow-hidden p-2 transition-all hover:scale-105"
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden relative mb-2">
                    <img src={item.small_poster} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 text-[9px] font-black bg-cyan-500 text-black px-1.5 py-0.5 rounded">
                      Ep {item.episode_number || item.max_episode_number}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-200 group-hover:text-cyan-400 truncate">
                    {item.name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Genre Pills Carousel */}
      {genres && genres.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 w-full">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
            {genres.slice(0, 15).map((genre) => (
              <Link
                key={genre.id}
                href={`/anime?genre=${encodeURIComponent(genre.name_en)}`}
                className="shrink-0 flex items-center gap-2 bg-[#0e111d] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 text-neutral-300 hover:text-cyan-300 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
              >
                <span>{genre.icon || '🏷️'}</span>
                <span>{genre.name_en}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14 w-full">
        {/* Trending Section */}
        <Section
          title="Trending Donghua & Anime"
          subtitle="Top rated and most watched series this week"
          action={
            <Link
              href="/popular"
              className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          }
        >
          {loadingTrending ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))}
            </div>
          ) : trending?.data?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {trending.data.map((item) => (
                <AnimeCard key={item.id} anime={item} />
              ))}
            </div>
          ) : (
            <EmptyState message="No trending series found." />
          )}
        </Section>

        {/* Latest Episodes Section */}
        <Section
          title="Latest Episodes"
          subtitle="Freshly updated episodes ready to watch right now"
          action={
            <Link
              href="/latest"
              className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          }
        >
          {loadingLatest ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))}
            </div>
          ) : latest?.data?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {latest.data.map((item) => (
                <AnimeCard key={item.id} anime={item} />
              ))}
            </div>
          ) : (
            <EmptyState message="No recently updated episodes." />
          )}
        </Section>

        {/* Chinese Donghua Section */}
        <Section
          title="Chinese Donghua (3D & 2D)"
          subtitle="Popular cultivation, wuxia, and fantasy series"
          action={
            <Link
              href="/anime?type=donghua"
              className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          }
        >
          {loadingDonghua ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))}
            </div>
          ) : donghua?.data?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {donghua.data.map((item) => (
                <AnimeCard key={item.id} anime={item} />
              ))}
            </div>
          ) : (
            <EmptyState message="No donghua series available." />
          )}
        </Section>

        {/* Japanese Anime Section */}
        <Section
          title="Japanese Anime"
          subtitle="Top shonen, isekai, and romance series"
          action={
            <Link
              href="/anime?type=anime"
              className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          }
        >
          {loadingJapanese ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))}
            </div>
          ) : animeJapanese?.data?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {animeJapanese.data.map((item) => (
                <AnimeCard key={item.id} anime={item} />
              ))}
            </div>
          ) : (
            <EmptyState message="No anime series available." />
          )}
        </Section>

        {/* Movies Section */}
        <Section
          title="Anime & Donghua Movies"
          subtitle="Feature length cinema releases and special films"
          action={
            <Link
              href="/movies"
              className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          }
        >
          {loadingMovies ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))}
            </div>
          ) : movies?.data?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {movies.data.map((item) => (
                <AnimeCard key={item.id} anime={item} />
              ))}
            </div>
          ) : (
            <EmptyState message="No movie releases available." />
          )}
        </Section>
      </main>

      <Footer />
    </div>
  )
}

'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Play, ChevronRight, Calendar, Compass, ArrowRight, Flame, Sparkles,
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

  const { data: trending,    isLoading: loadingTrending }  = useQuery({ queryKey: ['anime','trending'],  queryFn: () => animeService.list({ sort: 'views',   per_page: 8 }) })
  const { data: latest,      isLoading: loadingLatest }    = useQuery({ queryKey: ['anime','latest'],    queryFn: () => animeService.list({ sort: 'latest',  per_page: 8 }) })
  const { data: donghua,     isLoading: loadingDonghua }   = useQuery({ queryKey: ['anime','donghua'],   queryFn: () => animeService.list({ type: 'donghua', per_page: 8 }) })
  const { data: animeJapanese, isLoading: loadingJapanese }= useQuery({ queryKey: ['anime','japanese'],  queryFn: () => animeService.list({ type: 'anime',   per_page: 8 }) })
  const { data: movies,      isLoading: loadingMovies }    = useQuery({ queryKey: ['anime','movies'],    queryFn: () => animeService.list({ type: 'movie',   per_page: 8 }) })
  const { data: genres }     = useQuery({ queryKey: ['genres'],            queryFn: genreService.list })
  const { data: schedule }   = useQuery({ queryKey: ['schedule','today'],  queryFn: scheduleService.getWeeklySchedule })

  const todayAiring = schedule?.[todayName] ?? []

  const sectionGrid = (items: typeof trending, loading: boolean) =>
    loading ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <AnimeCardSkeleton key={i} />)}
      </div>
    ) : items?.data?.length ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.data.map((item) => <AnimeCard key={item.id} anime={item} />)}
      </div>
    ) : <EmptyState message="No results found." />

  return (
    <div className="min-h-screen bg-[#0a0608] text-white flex flex-col">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6">
        {/* Red glow spheres */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[380px] h-[380px] bg-rose-700/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-red-900/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Logo badge */}
          <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-red-500/25 rounded-full px-5 py-2 mb-6 shadow-[0_0_25px_rgba(225,29,72,0.2)]">
            <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-red-400">
              <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-bold text-red-300 tracking-wider uppercase">
              Official Production Platform • 4K HDR
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-5 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-red-400 via-rose-200 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(225,29,72,0.55)]">
              SC-ANIME
            </span>
            <span className="text-white ml-3">KH</span>
          </h1>

          <p className="text-rose-100/55 text-base sm:text-lg md:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Unlimited streaming of Chinese Donghua, Japanese Anime, and Movies.
            Instant loading with high-speed video servers and zero buffering.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/anime/tales-of-herding-gods/season-1/ep-1"
              className="flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold px-8 py-3.5 rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(225,29,72,0.45)] text-sm"
            >
              <Play size={18} fill="currentColor" />
              Watch Now — Tales of Herding Gods
            </Link>

            <Link
              href="/schedule"
              className="flex items-center gap-2 bg-[#130a0b] hover:bg-red-500/10 border border-red-500/25 hover:border-red-400 text-white font-bold px-6 py-3.5 rounded-2xl transition-all duration-300 hover:scale-105 text-sm"
            >
              <Calendar size={18} className="text-amber-400" />
              Broadcast Schedule
            </Link>

            <Link
              href="/genres"
              className="flex items-center gap-2 bg-[#130a0b] hover:bg-red-500/8 border border-white/8 hover:border-red-500/30 text-rose-100/60 hover:text-rose-100 font-bold px-6 py-3.5 rounded-2xl transition-all duration-300 hover:scale-105 text-sm"
            >
              <Compass size={18} className="text-red-400" />
              Browse Genres
            </Link>
          </div>
        </div>
      </section>

      {/* ── Today's Schedule Banner ───────────────────────────────────── */}
      {todayAiring.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 w-full">
          <div className="bg-gradient-to-r from-red-950/30 via-[#130a0b] to-rose-950/20 border border-red-500/18 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <Calendar size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Airing Today ({todayName})
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <span className="text-xs text-rose-100/40">Fresh updates scheduled for broadcast</span>
                </div>
              </div>
              <Link href="/schedule"
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 group">
                Full Schedule
                <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {todayAiring.slice(0, 6).map((item, idx) => (
                <Link key={`${item.anime_id}-${idx}`}
                  href={`/anime/${item.anime_id}/season-1/ep-${item.episode_number || 1}`}
                  className="group relative bg-black/40 border border-white/5 hover:border-red-500/35 rounded-xl overflow-hidden p-2 transition-all hover:scale-105"
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden relative mb-2">
                    <img src={item.small_poster} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded">
                      Ep {item.episode_number || item.max_episode_number}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-rose-100/70 group-hover:text-red-300 truncate">
                    {item.name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Genre Pills ───────────────────────────────────────────────── */}
      {genres && genres.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 w-full">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
            {genres.slice(0, 15).map((genre) => (
              <Link key={genre.id}
                href={`/anime?genre=${encodeURIComponent(genre.name_en)}`}
                className="shrink-0 flex items-center gap-2 bg-[#130a0b] hover:bg-red-500/10 border border-red-500/15 hover:border-red-400/40 text-rose-100/55 hover:text-red-300 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
              >
                <span>{genre.icon || '🏷️'}</span>
                <span>{genre.name_en}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14 w-full">

        <Section title="Trending Donghua & Anime" subtitle="Top rated and most watched series this week"
          action={<Link href="/popular" className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-bold flex items-center gap-1 group">
            View All <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>}>
          {sectionGrid(trending, loadingTrending)}
        </Section>

        <Section title="Latest Episodes" subtitle="Freshly updated episodes ready to watch right now"
          action={<Link href="/latest" className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-bold flex items-center gap-1 group">
            View All <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>}>
          {sectionGrid(latest, loadingLatest)}
        </Section>

        <Section title="Chinese Donghua (3D & 2D)" subtitle="Popular cultivation, wuxia, and fantasy series"
          action={<Link href="/anime?type=donghua" className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-bold flex items-center gap-1 group">
            View All <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>}>
          {sectionGrid(donghua, loadingDonghua)}
        </Section>

        <Section title="Japanese Anime" subtitle="Top shonen, isekai, and romance series"
          action={<Link href="/anime?type=anime" className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-bold flex items-center gap-1 group">
            View All <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>}>
          {sectionGrid(animeJapanese, loadingJapanese)}
        </Section>

        <Section title="Anime & Donghua Movies" subtitle="Feature length cinema releases and special films"
          action={<Link href="/movies" className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-bold flex items-center gap-1 group">
            View All <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>}>
          {sectionGrid(movies, loadingMovies)}
        </Section>

      </main>

      <Footer />
    </div>
  )
}

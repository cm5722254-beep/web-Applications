'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Play, ChevronRight, Calendar, Flame, Sparkles, Film, ArrowRight, Clock } from 'lucide-react'
import { animeService, genreService, scheduleService } from '@/services/api'
import { AnimeCard, AnimeCardSkeleton } from '@/components/ui/AnimeCard'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

function SectionHeader({ icon: Icon, title, href }: { icon: React.ElementType; title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="section-title">
        <Icon size={18} className="text-cyan-400" />
        {title}
      </h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-cyan-300 transition-colors group"
      >
        View All
        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  )
}

function AnimeGrid({ items, loading }: { items: any; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => <AnimeCardSkeleton key={i} />)}
      </div>
    )
  }
  const list = items?.data ?? items ?? []
  if (!list.length) return (
    <p className="text-neutral-600 text-sm py-8 text-center">No content available right now.</p>
  )
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 stagger-children">
      {list.slice(0, 12).map((item: any) => (
        <AnimeCard key={item.id ?? item.sno ?? item.slug} anime={item} />
      ))}
    </div>
  )
}

export default function HomePage() {
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  const { data: trending,  isLoading: loadingTrending  } = useQuery({ queryKey: ['anime', 'trending'],  queryFn: () => animeService.list({ sort: 'views',   per_page: 12 }) })
  const { data: latest,    isLoading: loadingLatest    } = useQuery({ queryKey: ['anime', 'latest'],    queryFn: () => animeService.list({ sort: 'latest',  per_page: 12 }) })
  const { data: donghua,   isLoading: loadingDonghua   } = useQuery({ queryKey: ['anime', 'donghua'],   queryFn: () => animeService.list({ type: 'donghua', per_page: 12 }) })
  const { data: japanese,  isLoading: loadingJapanese  } = useQuery({ queryKey: ['anime', 'japanese'],  queryFn: () => animeService.list({ type: 'anime',   per_page: 12 }) })
  const { data: movies,    isLoading: loadingMovies    } = useQuery({ queryKey: ['anime', 'movies'],    queryFn: () => animeService.list({ type: 'movie',   per_page: 12 }) })
  const { data: genres                                  } = useQuery({ queryKey: ['genres'],             queryFn: genreService.list })
  const { data: schedule                                } = useQuery({ queryKey: ['schedule', 'today'], queryFn: scheduleService.getWeeklySchedule })

  const todayAiring: any[] = schedule?.[todayName] ?? []

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 pb-20 px-4 sm:px-6">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-cyan-600/6 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[300px] bg-sky-700/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-full px-5 py-2 mb-7 shadow-[0_0_20px_rgba(0,212,255,0.1)]">
            <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-cyan-400/50">
              <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">
              Official Production Platform · 4K HDR
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 leading-none">
            <span className="block text-white">Stream Premium</span>
            <span className="block gradient-text-cyan text-glow-cyan">
              Donghua &amp; Anime
            </span>
          </h1>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Instant-play Chinese Donghua, Japanese Anime, and Movies in Full HD &amp; 4K Ultra HD.
            One click — zero buffering.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/anime?type=donghua"
              className="btn-neon text-base px-7 py-3 shadow-[0_0_20px_rgba(0,180,216,0.4)]"
            >
              <Play size={18} className="fill-white" />
              Start Watching
            </Link>
            <Link
              href="/schedule"
              className="flex items-center gap-2 text-sm font-bold text-neutral-300 hover:text-cyan-300 bg-white/5 hover:bg-cyan-500/8 border border-white/8 hover:border-cyan-500/25 px-6 py-3 rounded-xl transition-all"
            >
              <Calendar size={16} />
              Today's Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* ── Today's Schedule Strip ───────────────────────────────────────── */}
      {todayAiring.length > 0 && (
        <section className="px-4 sm:px-6 mb-10">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#0d0f1a] border border-cyan-500/15 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(0,212,255,0.05)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-cyan-400" />
                  <span className="text-sm font-bold text-cyan-300">Airing Today — {todayName}</span>
                  <span className="tag tag-cyan ml-1">{todayAiring.length} titles</span>
                </div>
                <Link href="/schedule" className="text-xs text-neutral-400 hover:text-cyan-300 transition-colors">
                  Full Schedule →
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 scroll-carousel">
                {todayAiring.map((item: any, i: number) => (
                  <Link
                    key={item.id ?? i}
                    href={`/anime/${item.slug ?? item.id}`}
                    className="flex items-center gap-2.5 bg-white/4 hover:bg-cyan-500/8 border border-white/6 hover:border-cyan-500/20 rounded-xl px-3 py-2 transition-all shrink-0 group"
                  >
                    {item.poster && (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-8 h-10 object-cover rounded-lg"
                      />
                    )}
                    <span className="text-xs font-semibold text-neutral-300 group-hover:text-cyan-200 max-w-[100px] line-clamp-2 leading-tight">
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-14 pb-16">

        {/* ── Trending ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Flame}     title="Trending Now"      href="/popular"           />
          <AnimeGrid items={trending} loading={loadingTrending} />
        </section>

        {/* ── Latest Updates ──────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Sparkles}  title="Latest Updates"    href="/latest"            />
          <AnimeGrid items={latest}   loading={loadingLatest}   />
        </section>

        {/* ── Chinese Donghua ─────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Play}      title="Chinese Donghua"   href="/anime?type=donghua" />
          <AnimeGrid items={donghua}  loading={loadingDonghua}  />
        </section>

        {/* ── Genres Quick Access ─────────────────────────────────────── */}
        {genres && genres.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">
                <ChevronRight size={18} className="text-cyan-400" />
                Browse by Genre
              </h2>
              <Link href="/genres" className="text-xs font-semibold text-neutral-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                All Genres <ArrowRight size={12} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 18).map((g: any) => (
                <Link
                  key={g.id}
                  href={`/anime?genre=${encodeURIComponent(g.name_en ?? g.name ?? g.slug ?? '')}`}
                  className="text-sm font-semibold text-neutral-300 hover:text-cyan-300 bg-white/4 hover:bg-cyan-500/8 border border-white/6 hover:border-cyan-500/20 px-3.5 py-1.5 rounded-xl transition-all"
                >
                  {g.name_en ?? g.name ?? g.slug}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Japanese Anime ───────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Sparkles}  title="Japanese Anime"    href="/anime?type=anime"  />
          <AnimeGrid items={japanese} loading={loadingJapanese} />
        </section>

        {/* ── Movies ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Film}      title="Movies"            href="/movies"            />
          <AnimeGrid items={movies}   loading={loadingMovies}   />
        </section>
      </div>

      <Footer />
    </div>
  )
}

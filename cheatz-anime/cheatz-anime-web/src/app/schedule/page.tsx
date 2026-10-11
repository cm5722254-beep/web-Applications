'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Calendar, Play, Clock, Sparkles, Film, ArrowRight } from 'lucide-react'
import { scheduleService, type ScheduleAnimeItem } from '@/services/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SchedulePage() {
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const defaultDay = DAYS.includes(todayName) ? todayName : 'Sunday'
  const [selectedDay, setSelectedDay] = useState<string>(defaultDay)

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['anime', 'schedule'],
    queryFn: scheduleService.getWeeklySchedule,
    staleTime: 1000 * 60 * 15, // 15 min cache
  })

  const currentList: ScheduleAnimeItem[] = schedule?.[selectedDay] || []

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-900/30 via-sky-950/20 to-blue-900/30 border border-cyan-500/20 p-8 sm:p-10 mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={13} />
                <span>Weekly Broadcast Schedule</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Release <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Calendar</span>
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-xl">
                Stay updated with official release days for all ongoing Chinese Donghua and Japanese Anime series.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-5 py-3 shrink-0">
              <Calendar className="text-cyan-400" size={28} />
              <div>
                <span className="text-xs text-neutral-400 block font-medium">Today is</span>
                <span className="text-base font-bold text-white">{todayName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day of Week Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {DAYS.map((day) => {
            const count = schedule?.[day]?.length || 0
            const isToday = day === todayName
            const isSelected = day === selectedDay

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 min-w-[120px] py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-1 border ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-black border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105'
                    : 'bg-[#0e111d] text-neutral-300 border-white/5 hover:border-cyan-500/30 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{day}</span>
                  {isToday && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-black' : 'bg-cyan-400 animate-pulse'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    isSelected ? 'text-black/80' : 'text-neutral-500'
                  }`}
                >
                  {count} {count === 1 ? 'Show' : 'Shows'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner size={44} />
            <p className="text-neutral-400 text-sm">Loading weekly schedule...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="py-20 text-center bg-[#0d0f19] border border-white/5 rounded-3xl p-8">
            <Film size={44} className="mx-auto text-neutral-600 mb-3" />
            <h3 className="text-lg font-bold text-neutral-300">No releases scheduled for {selectedDay}</h3>
            <p className="text-neutral-500 text-sm mt-1">Check back soon or choose another day of the week.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{selectedDay} Airing Series</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  {currentList.length}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {currentList.map((item, idx) => (
                <div
                  key={`${item.anime_id}-${idx}`}
                  className="group relative bg-[#0e111f] border border-white/5 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
                    <img
                      src={item.small_poster}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Episode Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-cyan-500 text-black shadow-md">
                        Ep {item.episode_number || item.max_episode_number}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-neutral-300 border border-white/10">
                        {item.anime_type || 'Donghua'}
                      </span>
                    </div>

                    {/* Quick Play Hover Button */}
                    <Link
                      href={`/anime/${item.anime_id}/season-1/ep-${item.episode_number || 1}`}
                      className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]"
                    >
                      <div className="w-12 h-12 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)] transform scale-90 group-hover:scale-100 transition-transform">
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                      </div>
                    </Link>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/anime/${item.anime_id}`}
                        className="text-xs font-bold text-white hover:text-cyan-400 line-clamp-2 leading-snug transition-colors"
                        title={item.name}
                      >
                        {item.name}
                      </Link>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400 capitalize">
                        {item.anime_origin || 'Chinese'}
                      </span>
                      <Link
                        href={`/anime/${item.anime_id}/season-1/ep-${item.episode_number || 1}`}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1"
                      >
                        <span>Watch</span>
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

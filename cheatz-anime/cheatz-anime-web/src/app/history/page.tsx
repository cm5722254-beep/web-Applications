'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Clock, Play, RotateCcw, Film } from 'lucide-react'
import { historyService } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner, EmptyState } from '@/components/ui'

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/history')
  }, [user, loading, router])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['watch-history'],
    queryFn: () => historyService.list(),
    enabled: !!user,
  })

  const { mutate: removeEntry } = useMutation({
    mutationFn: (id: number) => historyService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watch-history'] }),
  })

  const { mutate: clearAll, isPending: clearing } = useMutation({
    mutationFn: historyService.clearAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watch-history'] }),
  })

  if (loading || !user) return null

  const entries = data?.data ?? []

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/12 border border-cyan-500/18">
                <Clock size={22} className="text-cyan-400" />
              </div>
              Watch History
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              {entries.length} episode{entries.length !== 1 ? 's' : ''} watched
            </p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={() => clearAll()}
              disabled={clearing}
              className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 px-4 py-2 rounded-xl transition-all"
            >
              {clearing ? <LoadingSpinner size={14} /> : <RotateCcw size={14} />}
              Clear All
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={44} />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/18 flex items-center justify-center">
              <Film size={36} className="text-cyan-400/50" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">No watch history yet</h3>
              <p className="text-neutral-400 text-sm">Episodes you watch will appear here automatically.</p>
            </div>
            <Link
              href="/"
              className="bg-gradient-to-r from-cyan-600 to-sky-700 text-black font-extrabold px-6 py-2.5 rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,212,255,0.4)] text-sm"
            >
              Browse Anime
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const progressPct = entry.duration_seconds
                ? Math.min(100, Math.round((entry.progress_seconds / entry.duration_seconds) * 100))
                : 0
              const animeSlug = entry.episode?.anime?.slug || ''
              const epSlug = entry.episode?.slug || 'ep-1'

              return (
                <div
                  key={entry.id}
                  className="group flex items-center gap-4 bg-[#0d0f1a] border border-white/5 hover:border-cyan-500/18 rounded-2xl p-4 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-white/5">
                    {entry.episode?.thumbnail_url || entry.episode?.anime?.poster_url ? (
                      <img
                        src={entry.episode.thumbnail_url || entry.episode.anime!.poster_url || ''}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-[#0a0c18]">
                        🎬
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">
                      {entry.episode?.anime?.title_en || 'Unknown Anime'}
                    </p>
                    <p className="text-neutral-400 text-xs truncate mt-0.5">
                      Episode {entry.episode?.episode_number ?? '?'}{entry.episode?.title_en ? ` — ${entry.episode.title_en}` : ''}
                    </p>
                    {entry.duration_seconds ? (
                      <div className="mt-2.5">
                        <div className="w-full bg-white/5 rounded-full h-1">
                          <div
                            className="bg-gradient-to-r from-cyan-600 to-sky-600 h-1 rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{progressPct}% watched</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Date + Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-[11px] text-neutral-500">
                      {new Date(entry.last_watched_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-1">
                      {animeSlug && (
                        <Link
                          href={`/anime/${animeSlug}/season-1/${epSlug}`}
                          className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/12 transition-colors"
                          title="Resume watching"
                        >
                          <Play size={14} fill="currentColor" />
                        </Link>
                      )}
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

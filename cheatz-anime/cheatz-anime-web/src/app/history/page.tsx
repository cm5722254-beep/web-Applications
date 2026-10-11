'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { historyService } from '@/services/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner, EmptyState, ErrorMessage } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Play } from 'lucide-react'

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['watch-history'],
    queryFn: () => historyService.list(),
    enabled: !!user,
  })

  const { mutate: removeEntry } = useMutation({
    mutationFn: (id: number) => historyService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watch-history'] }),
  })

  const { mutate: clearAll } = useMutation({
    mutationFn: historyService.clearAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watch-history'] }),
  })

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-brand-text font-khmer">🕐 {t('nav.history')}</h1>
          {data?.data && data.data.length > 0 && (
            <button
              onClick={() => clearAll()}
              className="text-sm text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {isError ? (
          <ErrorMessage message="Failed to load watch history." onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size={40} /></div>
        ) : data?.data.length === 0 ? (
          <EmptyState title="No watch history" description="Episodes you watch will appear here." />
        ) : (
          <div className="space-y-3">
            {data?.data.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 bg-brand-surface border border-brand-border rounded-xl p-4"
              >
                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-brand-bg shrink-0">
                  {entry.episode?.thumbnail_url ? (
                    <img src={entry.episode.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : entry.episode?.anime?.poster_url ? (
                    <img src={entry.episode.anime.poster_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-brand-text text-sm font-semibold truncate font-khmer">
                    {entry.episode?.anime?.title_km || entry.episode?.anime?.title_en || 'Unknown'}
                  </p>
                  <p className="text-brand-muted text-xs truncate">
                    Ep {entry.episode?.episode_number}: {entry.episode?.title_en || 'Unknown'}
                  </p>
                  {/* Progress bar */}
                  {entry.duration_seconds && (
                    <div className="w-full bg-brand-border rounded-full h-1 mt-2">
                      <div
                        className="bg-brand-violet h-1 rounded-full"
                        style={{ width: `${Math.min(100, (entry.progress_seconds / entry.duration_seconds) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-brand-muted text-xs">
                    {new Date(entry.last_watched_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-brand-muted hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

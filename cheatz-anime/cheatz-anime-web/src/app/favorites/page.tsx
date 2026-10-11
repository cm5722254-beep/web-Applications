'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritesService } from '@/services/api'
import { AnimeCard } from '@/components/ui/AnimeCard'
import { AnimeCardSkeleton, EmptyState, ErrorMessage } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.list(),
    enabled: !!user,
  })

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-brand-text mb-8 font-khmer">
          ❤️ {t('nav.favorites')}
        </h1>

        {isError ? (
          <ErrorMessage message="Failed to load favorites." onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={i} />)}
          </div>
        ) : data?.data.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Browse the catalog and add anime to your favorites."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data?.data.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

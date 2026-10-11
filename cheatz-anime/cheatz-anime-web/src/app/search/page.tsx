'use client'

import { useState, useEffect, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { animeService } from '@/services/api'
import { AnimeCard } from '@/components/ui/AnimeCard'
import { AnimeCardSkeleton, EmptyState, ErrorMessage, LoadingSpinner } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useI18n } from '@/i18n'

function SearchContent() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => animeService.search(debouncedQuery, { per_page: 24 }),
    enabled: debouncedQuery.length >= 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ស្វែងរកតាមចំណងជើងរឿងចិន, ភាពយន្ត, អ្នីម៉េ..."
              className="w-full bg-brand-surface border border-brand-border rounded-2xl pl-12 pr-4 py-3.5 text-brand-text placeholder-brand-muted focus:border-brand-violet focus:outline-none focus:ring-1 focus:ring-brand-violet/40 transition-all font-khmer text-sm"
              autoFocus
            />
          </div>
        </form>

        {/* Results */}
        {debouncedQuery.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-brand-muted font-khmer text-base">សូមវាយបញ្ចូលឈ្មោះរឿងដែលអ្នកចង់ស្វែងរក</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="max-w-md mx-auto py-12">
            <ErrorMessage message="មានបញ្ហាក្នុងការស្វែងរក" onRetry={refetch} />
          </div>
        ) : data?.data.length === 0 ? (
          <EmptyState title={t('common.no_results')} description={`រកមិនឃើញរឿង "${debouncedQuery}" នោះទេ។`} />
        ) : (
          <>
            <p className="text-brand-muted text-sm mb-4 font-khmer">
              រកឃើញ <span className="text-brand-text font-bold">{data?.meta.total}</span> លទ្ធផលសម្រាប់ &ldquo;{debouncedQuery}&rdquo;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data?.data.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg flex items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}

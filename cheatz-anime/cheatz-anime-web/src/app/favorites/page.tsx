'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Sparkles } from 'lucide-react'
import { favoritesService } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AnimeCard } from '@/components/ui/AnimeCard'
import { AnimeCardSkeleton } from '@/components/ui'

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/favorites')
  }, [user, loading, router])

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.list(),
    enabled: !!user,
  })

  if (loading || !user) return null

  const items = data?.data ?? []

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/15 border border-pink-500/20">
              <Heart size={22} className="text-pink-400" />
            </div>
            My Favorites
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            {items.length} saved series
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
              <Heart size={36} className="text-pink-400/50" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">No favorites yet</h3>
              <p className="text-neutral-400 text-sm">Browse the catalog and tap the heart icon to save anime.</p>
            </div>
            <Link
              href="/"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold px-6 py-2.5 rounded-xl hover:scale-105 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.4)] text-sm flex items-center gap-2"
            >
              <Sparkles size={15} /> Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

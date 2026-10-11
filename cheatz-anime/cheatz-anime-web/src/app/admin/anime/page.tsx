'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Film,
  Search,
  ArrowLeft,
  Crown,
  Eye,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Layers,
  Star
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'
import animeCatalogData from '@/data/animekill_catalog.json'

interface AnimeCatalogItem {
  sno: number
  name: string
  anime_type?: string
  anime_origin?: string
  genre?: string
  score?: string
  total_watch?: number
  is_vip_only?: boolean
}

export default function AdminAnimePage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'donghua' | 'anime' | 'movie'>('all')
  const [vipOverrides, setVipOverrides] = useState<Record<number, boolean>>({})
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/')
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sc_anime_vip_overrides')
      if (stored) setVipOverrides(JSON.parse(stored))
    } catch {}
  }, [])

  const catalog = useMemo(() => {
    const map = ((animeCatalogData as any)?.animes || {}) as Record<string, any>
    return Object.values(map)
  }, [])

  const filtered = useMemo(() => {
    return catalog.filter((item: any) => {
      const title = item.title || item.name || ''
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase())
      if (!matchesSearch) return false

      if (filterType === 'donghua') return item.type === 'donghua' || item.anime_type === 'donghua'
      if (filterType === 'anime') return item.type === 'anime' || item.anime_type === 'anime'
      if (filterType === 'movie') return item.type === 'movie' || item.anime_type === 'movie'
      return true
    })
  }, [catalog, search, filterType])

  const toggleAnimeVip = (sno: number, name: string) => {
    const next = !vipOverrides[sno]
    const updated = { ...vipOverrides, [sno]: next }
    setVipOverrides(updated)
    localStorage.setItem('sc_anime_vip_overrides', JSON.stringify(updated))
    setNotification(next ? `បានកំណត់រឿង "${name}" សម្រាប់តែ VIP!` : `បានកំណត់រឿង "${name}" សម្រាប់ទស្សនាឥតគិតថ្លៃ!`)
    setTimeout(() => setNotification(null), 3000)
  }

  if (loading || !user || !isAdmin) return null

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      <Navbar />

      {notification && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-xl bg-amber-950/90 border border-amber-500/50 text-amber-300 text-sm font-semibold shadow-2xl flex items-center gap-2 animate-slide-in">
          <Crown size={16} className="text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 bg-brand-surface border border-brand-border hover:border-brand-violet rounded-xl text-brand-muted hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-khmer">
                គ្រប់គ្រងមាតិការឿង (Anime Catalog)
              </h1>
              <p className="text-brand-muted text-xs sm:text-sm font-khmer mt-1">
                សរុប {catalog.length} រឿង · កំណត់សិទ្ធិ VIP-Only លើរឿងនីមួយៗ
              </p>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'ទាំងអស់ (All)' },
              { id: 'donghua', label: '🐉 ដុងហ្វ័រ (Chinese)' },
              { id: 'anime', label: '⚡ អ្នីម៉េ (Anime)' },
              { id: 'movie', label: '🎬 ភាពយន្ត (Movies)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterType === tab.id
                    ? 'bg-brand-violet text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-border/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមចំណងជើងរឿង..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border focus:border-brand-violet rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-brand-text placeholder-brand-muted outline-none transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-brand-bg/60 border-b border-brand-border text-brand-muted font-khmer uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">ចំណងជើងរឿង (Title)</th>
                  <th className="py-3.5 px-4">ប្រភេទ (Type)</th>
                  <th className="py-3.5 px-4">ពិន្ទុ (Score)</th>
                  <th className="py-3.5 px-4">សិទ្ធិទស្សនា (VIP ONLY)</th>
                  <th className="py-3.5 px-4 text-right">បើកទស្សនា</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filtered.slice(0, 50).map((item) => {
                  const isVipOnly = !!vipOverrides[item.sno]
                  const poster =
                    item.small_poster ||
                    item.large_poster ||
                    item.orginal_poster ||
                    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=80'

                  return (
                    <tr key={item.sno} className="hover:bg-brand-border/20 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={poster}
                            alt={item.name}
                            className="w-10 h-14 object-cover rounded-lg ring-1 ring-brand-border shrink-0"
                            onError={(e) => {
                              ;(e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                          <div>
                            <span className="font-bold text-white text-sm line-clamp-1">{item.name}</span>
                            <span className="text-[11px] text-brand-muted line-clamp-1 mt-0.5 font-khmer">
                              {item.genre || 'Action, Fantasy'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-brand-bg border border-brand-border text-xs uppercase font-semibold text-brand-muted">
                          {item.anime_type || item.anime_origin || 'Anime'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                          <Star size={13} fill="currentColor" />
                          <span>{item.score || '9.5'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleAnimeVip(item.sno, item.name)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isVipOnly
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                              : 'bg-brand-bg text-brand-muted border border-brand-border hover:border-amber-400/50 hover:text-amber-400'
                          }`}
                        >
                          <Crown size={13} className={isVipOnly ? 'text-amber-400' : ''} />
                          <span>{isVipOnly ? 'VIP Only 🔒' : 'ទស្សនាឥតគិតថ្លៃ (Free)'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/anime/${item.sno}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-bg border border-brand-border hover:border-brand-violet text-brand-muted hover:text-white text-xs font-semibold transition-colors"
                        >
                          <Eye size={13} />
                          <span>ទស្សនា</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-brand-bg/40 border-t border-brand-border text-xs text-brand-muted text-center font-khmer">
            បង្ហាញ 50 រឿងដំបូង ក្នុងចំណោម {filtered.length} រឿង
          </div>
        </div>
      </main>
    </div>
  )
}

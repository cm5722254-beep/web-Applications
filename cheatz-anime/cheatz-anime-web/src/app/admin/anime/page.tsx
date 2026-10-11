'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Film, Search, ArrowLeft, Crown, Eye, Star, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'
import animeCatalogData from '@/data/animekill_catalog.json'

export default function AdminAnimePage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  const [search, setSearch]           = useState('')
  const [filterType, setFilterType]   = useState<'all'|'donghua'|'anime'|'movie'>('all')
  const [vipOverrides, setVipOverrides] = useState<Record<number, boolean>>({})
  const [toast, setToast]             = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/')
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    try {
      const s = localStorage.getItem('sc_anime_vip_overrides')
      if (s) setVipOverrides(JSON.parse(s))
    } catch {}
  }, [])

  const catalog = useMemo(() => {
    const map = ((animeCatalogData as any)?.animes || {}) as Record<string, any>
    return Object.values(map)
  }, [])

  const filtered = useMemo(() => {
    return catalog.filter((item: any) => {
      const title = (item.title || item.name || '').toLowerCase()
      if (search && !title.includes(search.toLowerCase())) return false
      if (filterType === 'donghua') return item.type === 'donghua' || item.anime_origin === 'chinese'
      if (filterType === 'anime')   return item.type === 'anime'
      if (filterType === 'movie')   return item.type === 'movie'
      return true
    })
  }, [catalog, search, filterType])

  const toggleVip = (sno: number, name: string) => {
    const next = !vipOverrides[sno]
    const updated = { ...vipOverrides, [sno]: next }
    setVipOverrides(updated)
    localStorage.setItem('sc_anime_vip_overrides', JSON.stringify(updated))
    setToast(next ? `"${name}" — VIP Only 🔒` : `"${name}" — Free Access ✓`)
    setTimeout(() => setToast(null), 2800)
  }

  if (loading || !user || !isAdmin) return null

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-xl bg-amber-950/90 border border-amber-500/50 text-amber-300 text-sm font-semibold shadow-2xl flex items-center gap-2 animate-slide-up">
          <Crown size={15} className="text-amber-400" /> {toast}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 bg-[#0d0f1a] border border-cyan-500/15 hover:border-cyan-400/35 rounded-xl text-neutral-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">Anime Catalog Management</h1>
              <p className="text-neutral-500 text-xs sm:text-sm font-sans mt-0.5">
                {catalog.length} titles · Set VIP-Only or Free access per series
              </p>
            </div>
          </div>
        </div>

        {/* Filter + Search */}
        <div className="bg-[#0d0f1a] border border-cyan-500/15 rounded-2xl p-4 mb-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
            {([
              ['all',    'All Titles'],
              ['donghua','🐉 Donghua (Chinese)'],
              ['anime',  '⚡ Anime (Japanese)'],
              ['movie',  '🎬 Movies'],
            ] as const).map(([id, label]) => (
              <button key={id} onClick={() => setFilterType(id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterType === id
                    ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-cyan-500/8'
                }`}>
                {label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input type="text" placeholder="Search anime title..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#07080f] border border-cyan-500/15 focus:border-cyan-500/40 rounded-xl pl-10 pr-9 py-2 text-sm text-white placeholder-neutral-600 outline-none transition-colors" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0d0f1a] border border-cyan-500/15 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#07080f]/70 border-b border-cyan-500/10 text-neutral-500 uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-5">Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Access Control</th>
                  <th className="py-3.5 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/8">
                {filtered.slice(0, 50).map((item: any) => {
                  const isVip   = !!vipOverrides[item.sno]
                  const poster  = item.small_poster || item.large_poster || item.orginal_poster || null
                  const title   = item.title || item.name || 'Unknown'
                  const slug    = item.sno || item.slug || ''

                  return (
                    <tr key={item.sno} className="hover:bg-cyan-500/4 transition-colors">
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          {poster ? (
                            <img src={poster} alt={title}
                              className="w-10 h-14 object-cover rounded-lg ring-1 ring-cyan-500/20 shrink-0"
                              onError={e => (e.target as HTMLElement).style.display = 'none'} />
                          ) : (
                            <div className="w-10 h-14 bg-cyan-500/10 border border-cyan-500/15 rounded-lg flex items-center justify-center shrink-0">
                              <Film size={16} className="text-cyan-400/50" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-white text-sm line-clamp-1">{title}</span>
                            {item.genre && <span className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">{item.genre}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#07080f] border border-cyan-500/10 text-xs uppercase font-semibold text-neutral-500">
                          {item.anime_type || item.anime_origin || 'Anime'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                          <Star size={12} fill="currentColor" />
                          {item.score || '9.0'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button onClick={() => toggleVip(item.sno, title)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isVip
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                              : 'bg-[#07080f] text-neutral-500 border border-cyan-500/10 hover:border-amber-500/25 hover:text-amber-400/70'
                          }`}>
                          <Crown size={12} className={isVip ? 'text-amber-400' : ''} />
                          {isVip ? 'VIP Only 🔒' : 'Free Access'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/anime/${slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#07080f] border border-cyan-500/10 hover:border-cyan-400/30 text-neutral-500 hover:text-white text-xs font-semibold transition-colors">
                          <Eye size={12} /> View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-[#07080f]/50 border-t border-cyan-500/8 text-xs text-neutral-600 text-center font-sans">
            Showing 50 of {filtered.length} titles
          </div>
        </div>
      </main>
    </div>
  )
}

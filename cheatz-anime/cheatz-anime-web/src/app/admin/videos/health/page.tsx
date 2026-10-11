'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Video, Play, AlertTriangle, CheckCircle, Wrench, Search,
  ArrowLeft, TrendingUp, Zap, ExternalLink, Loader2, XCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'
import type { VideoHealthEntry, VideoHealthStats } from '@/types'

interface HealthResponse extends VideoHealthStats {
  entries: VideoHealthEntry[]
}

export default function VideoHealthPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  const [data, setData] = useState<HealthResponse | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'working' | 'broken' | 'fixed'>('all')
  const [isAutoFixing, setIsAutoFixing] = useState(false)
  const [fixingEpisodes, setFixingEpisodes] = useState<Set<number>>(new Set())
  const [updatingEpisodes, setUpdatingEpisodes] = useState<Set<number>>(new Set())
  const [manualUrls, setManualUrls] = useState<Record<number, string>>({})

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/')
    }
  }, [user, isAdmin, loading, router])

  // Fetch status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/videos/status')
      if (response.ok) {
        const jsonData = await response.json()
        setData(jsonData)
      }
    } catch (err) {
      console.error('Failed to fetch status:', err)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  // Poll while scanning
  useEffect(() => {
    if (!data?.isScanning) return

    const interval = setInterval(fetchStatus, 2000)
    return () => clearInterval(interval)
  }, [data?.isScanning])

  // Start scan
  const handleStartScan = async () => {
    try {
      const response = await fetch('/api/admin/videos/scan', { method: 'POST' })
      if (response.ok) {
        setTimeout(fetchStatus, 500)
      }
    } catch (err) {
      console.error('Failed to start scan:', err)
    }
  }

  // Auto-fix single episode
  const handleAutoFix = async (entry: VideoHealthEntry) => {
    setFixingEpisodes(prev => new Set(prev).add(entry.episodeId))
    try {
      const response = await fetch('/api/admin/videos/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId: entry.episodeId,
          animeSlug: entry.animeSlug,
          episodeNumber: entry.episodeNumber,
        }),
      })

      if (response.ok) {
        await fetchStatus()
      } else {
        alert('No working source found for this episode')
      }
    } catch (err) {
      console.error('Failed to auto-fix:', err)
      alert('Auto-fix failed')
    } finally {
      setFixingEpisodes(prev => {
        const next = new Set(prev)
        next.delete(entry.episodeId)
        return next
      })
    }
  }

  // Auto-fix all broken
  const handleAutoFixAll = async () => {
    if (!data) return
    const brokenEntries = data.entries.filter(e => e.status === 'broken')
    if (brokenEntries.length === 0) {
      alert('No broken videos to fix')
      return
    }

    if (!confirm(`Auto-fix ${brokenEntries.length} broken videos?`)) return

    setIsAutoFixing(true)
    let fixedCount = 0

    for (const entry of brokenEntries) {
      try {
        const response = await fetch('/api/admin/videos/fix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            episodeId: entry.episodeId,
            animeSlug: entry.animeSlug,
            episodeNumber: entry.episodeNumber,
          }),
        })

        if (response.ok) fixedCount++
        
        // Rate limit: 500ms between fixes
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (err) {
        console.error(`Failed to fix episode ${entry.episodeId}:`, err)
      }
    }

    setIsAutoFixing(false)
    await fetchStatus()
    alert(`Fixed ${fixedCount} out of ${brokenEntries.length} videos`)
  }

  // Manual URL update
  const handleManualUpdate = async (episodeId: number) => {
    const newUrl = manualUrls[episodeId]
    if (!newUrl || newUrl.trim() === '') {
      alert('Please enter a URL')
      return
    }

    setUpdatingEpisodes(prev => new Set(prev).add(episodeId))
    try {
      const response = await fetch('/api/admin/videos/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId, newUrl }),
      })

      if (response.ok) {
        setManualUrls(prev => {
          const next = { ...prev }
          delete next[episodeId]
          return next
        })
        await fetchStatus()
      } else {
        const result = await response.json()
        alert(result.error || 'Update failed')
      }
    } catch (err) {
      console.error('Failed to update URL:', err)
      alert('Update failed')
    } finally {
      setUpdatingEpisodes(prev => {
        const next = new Set(prev)
        next.delete(episodeId)
        return next
      })
    }
  }

  if (loading || !user || !isAdmin) return null

  const filteredEntries = data?.entries.filter(entry => {
    const matchesSearch = entry.animeTitleEn.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'working' && entry.status === 'working') ||
      (statusFilter === 'broken' && entry.status === 'broken') ||
      (statusFilter === 'fixed' && entry.status === 'fixed')
    
    return matchesSearch && matchesStatus
  }) || []

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin"
            className="w-10 h-10 rounded-xl bg-[#0d0f1a] border border-cyan-500/20 hover:border-cyan-400/40 flex items-center justify-center transition-all">
            <ArrowLeft size={18} className="text-cyan-400" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Video Health Monitor
            </h1>
            <p className="text-neutral-400 text-sm font-sans">
              ពិនិត្យវីដេអូទាំងអស់ · Auto-fix broken videos · 100% availability
            </p>
          </div>
        </div>

        {/* ── Stats Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Episodes', value: data?.total || 0, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
            { label: 'Working', value: data?.working || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Broken', value: data?.broken || 0, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { label: 'Fixed', value: data?.fixed || 0, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map(stat => (
            <div key={stat.label}
              className={`bg-[#0d0f1a] border ${stat.bg} rounded-2xl p-5 hover:-translate-y-0.5 transition-transform`}>
              <p className="text-xs text-neutral-500 font-sans font-semibold mb-1">{stat.label}</p>
              <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Action Bar ──────────────────────────────────────────────── */}
        <div className="bg-[#0d0f1a] border border-cyan-500/15 rounded-2xl p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <button
              onClick={handleStartScan}
              disabled={data?.isScanning}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(0,212,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {data?.isScanning ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Scanning... {data.scanProgress}%
                </>
              ) : (
                <>
                  <Zap size={17} />
                  Scan All Videos
                </>
              )}
            </button>

            <button
              onClick={handleAutoFixAll}
              disabled={isAutoFixing || data?.isScanning || !data?.broken}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(245,158,11,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {isAutoFixing ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <Wrench size={17} />
                  Auto-Fix All Broken
                </>
              )}
            </button>

            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search by anime title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#07080f] border border-cyan-500/20 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400/40 transition-all"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { key: 'all', label: 'All' },
              { key: 'working', label: 'Working' },
              { key: 'broken', label: 'Broken' },
              { key: 'fixed', label: 'Fixed' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === tab.key
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-[#07080f] text-neutral-500 border border-cyan-500/10 hover:text-neutral-300'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scan Progress Bar ───────────────────────────────────────── */}
        {data?.isScanning && (
          <div className="bg-[#0d0f1a] border border-cyan-500/15 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">Scanning episodes...</span>
              <span className="text-sm font-bold text-cyan-400">{data.scanProgress}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#07080f] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-sky-600 transition-all duration-500"
                style={{ width: `${data.scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Episodes Table ──────────────────────────────────────────── */}
        {!data || data.entries.length === 0 ? (
          <div className="bg-[#0d0f1a] border border-cyan-500/15 rounded-2xl p-12 text-center">
            <Video size={48} className="mx-auto mb-4 text-cyan-400/50" />
            <h3 className="text-xl font-bold text-white mb-2">No scan data yet</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Click "Scan All Videos" to check video health across all episodes
            </p>
            <button
              onClick={handleStartScan}
              disabled={data?.isScanning}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-sm">
              Start Scan
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="bg-[#0d0f1a] border border-cyan-500/15 rounded-2xl p-12 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-400" />
            <h3 className="text-xl font-bold text-white mb-2">
              {statusFilter === 'broken' ? 'No broken videos! 🎉' : 'No results'}
            </h3>
            <p className="text-neutral-400 text-sm">
              {statusFilter === 'broken'
                ? 'All videos are working correctly'
                : 'Try adjusting your search or filter'}
            </p>
          </div>
        ) : (
          <div className="bg-[#0d0f1a] border border-cyan-500/15 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#07080f] border-b border-cyan-500/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-400 uppercase">Anime</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-400 uppercase">Season</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-400 uppercase">Ep</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-400 uppercase">URL</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {filteredEntries.map(entry => {
                    const isBrokenOrUnchecked = entry.status === 'broken' || entry.status === 'unchecked'
                    const isFixing = fixingEpisodes.has(entry.episodeId)
                    const isUpdating = updatingEpisodes.has(entry.episodeId)

                    return (
                      <tr key={entry.episodeId} className="hover:bg-[#07080f]/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-white font-semibold">{entry.animeTitleEn}</td>
                        <td className="px-4 py-3 text-sm text-neutral-400">S{entry.seasonNumber}</td>
                        <td className="px-4 py-3 text-sm text-neutral-400">E{entry.episodeNumber}</td>
                        <td className="px-4 py-3">
                          {entry.status === 'working' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                              <CheckCircle size={11} /> Working
                            </span>
                          )}
                          {entry.status === 'broken' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold">
                              <XCircle size={11} /> Broken
                            </span>
                          )}
                          {entry.status === 'checking' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                              <Loader2 size={11} className="animate-spin" /> Checking
                            </span>
                          )}
                          {entry.status === 'fixed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold">
                              <Wrench size={11} /> Fixed
                            </span>
                          )}
                          {entry.status === 'unchecked' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-500/20 text-neutral-400 border border-neutral-500/30 text-xs font-bold">
                              Unchecked
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {entry.currentUrl ? (
                            <a
                              href={entry.currentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 max-w-xs truncate">
                              {entry.currentUrl.substring(0, 50)}...
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-500">No URL</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isBrokenOrUnchecked ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAutoFix(entry)}
                                  disabled={isFixing}
                                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 transition-colors flex items-center gap-1">
                                  {isFixing ? <Loader2 size={11} className="animate-spin" /> : <Wrench size={11} />}
                                  Auto-Fix
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="New URL..."
                                  value={manualUrls[entry.episodeId] || ''}
                                  onChange={e => setManualUrls(prev => ({ ...prev, [entry.episodeId]: e.target.value }))}
                                  className="flex-1 px-2 py-1 text-xs rounded-lg bg-[#07080f] border border-cyan-500/20 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400/40"
                                />
                                <button
                                  onClick={() => handleManualUpdate(entry.episodeId)}
                                  disabled={isUpdating}
                                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 transition-colors">
                                  {isUpdating ? <Loader2 size={11} className="animate-spin" /> : 'Update'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-500">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

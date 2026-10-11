'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui'
import {
  ShieldCheck, User, Sliders, Database, Crown, Lock,
} from 'lucide-react'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [autoplay, setAutoplay] = useState(true)
  const [defaultQuality, setDefaultQuality] = useState('1080p')
  const [cacheCleared, setCacheCleared] = useState(false)

  // ── Auth Guard: redirect to login if not authenticated ──────────────────
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/settings')
    }
  }, [user, loading, router])

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cheatz_watch_history')
      } catch {}
    }
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 3000)
  }

  // Show loading while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#07080f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size={44} />
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <Lock size={14} className="text-cyan-400" />
            <span>Verifying access...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders size={13} />
            <span>Preferences</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Settings &amp; <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Preferences</span>
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Manage your player and account configurations.
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-[#0d0f1a] border border-white/8 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2.5 mb-4">
              <User size={17} className="text-cyan-400" />
              Google Account
            </h2>

            {user && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full border-2 border-cyan-400/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-cyan-500/18 text-cyan-400 font-bold flex items-center justify-center text-lg">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-sm">{user.name}</h3>
                    <p className="text-xs text-neutral-400">{user.email}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 mt-0.5 font-semibold">
                      <ShieldCheck size={10} /> Verified Google Account
                    </span>
                  </div>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl font-bold flex items-center gap-1 w-fit">
                  <Crown size={12} /> VIP Active
                </span>
              </div>
            )}
          </div>

          {/* Player Preferences */}
          <div className="bg-[#0d0f1a] border border-white/8 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2.5 mb-4">
              <Sliders size={17} className="text-cyan-400" />
              Player &amp; Streaming
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <span className="text-sm font-semibold text-white block">Auto-Play Next Episode</span>
                  <span className="text-xs text-neutral-400">Automatically advance to the next episode when finished</span>
                </div>
                <button
                  onClick={() => setAutoplay(!autoplay)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    autoplay ? 'bg-cyan-600' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                      autoplay ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <span className="text-sm font-semibold text-white block">Default Video Quality</span>
                  <span className="text-xs text-neutral-400">Preferred resolution for supported streams</span>
                </div>
                <select
                  value={defaultQuality}
                  onChange={(e) => setDefaultQuality(e.target.value)}
                  className="bg-black/60 border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="4K">4K Ultra HD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="720p">720p HD</option>
                  <option value="auto">Auto Adaptive</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="text-sm font-semibold text-white block">Clear Playback Cache</span>
                  <span className="text-xs text-neutral-400">Reset saved watch positions and local history</span>
                </div>
                <button
                  onClick={handleClearCache}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-neutral-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors flex items-center gap-1.5"
                >
                  <Database size={13} />
                  <span>{cacheCleared ? '✓ Cleared' : 'Clear Cache'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

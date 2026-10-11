'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  ShieldAlert,
  ShieldCheck,
  User,
  Sliders,
  Database,
  Mail,
  CheckCircle,
  ExternalLink,
  Crown,
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [autoplay, setAutoplay] = useState(true)
  const [defaultQuality, setDefaultQuality] = useState('1080p')
  const [cacheCleared, setCacheCleared] = useState(false)

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cheatz_watch_history')
      } catch (_e) {}
    }
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders size={13} />
            <span>Preferences & Legal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Settings & <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Copyright</span>
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Manage your player configurations and review intellectual property policies.
          </p>
        </div>

        <div className="space-y-8">
          {/* Account Overview */}
          <div className="bg-[#0e111f] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5 mb-4">
              <User size={18} className="text-cyan-400" />
              <span>Google Account Information</span>
            </h2>

            {user ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-cyan-400/50" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-lg">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-base">{user.name}</h3>
                    <p className="text-xs text-neutral-400">{user.email}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 mt-1 font-semibold">
                      <ShieldCheck size={11} /> Verified Real Google Login
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl font-bold flex items-center gap-1">
                    <Crown size={12} /> VIP Active
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-neutral-400 flex items-center justify-between">
                <span>Not signed in with Google.</span>
                <a
                  href="/login"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-1.5 rounded-xl text-xs transition-colors"
                >
                  Sign In with Google
                </a>
              </div>
            )}
          </div>

          {/* Streaming & Player Preferences */}
          <div className="bg-[#0e111f] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5 mb-4">
              <Sliders size={18} className="text-cyan-400" />
              <span>Player & Streaming Preferences</span>
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <span className="text-sm font-semibold text-white block">Auto-Play Next Episode</span>
                  <span className="text-xs text-neutral-400">Automatically advance to subsequent episode upon finish</span>
                </div>
                <button
                  onClick={() => setAutoplay(!autoplay)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    autoplay ? 'bg-cyan-500' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                      autoplay ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <span className="text-sm font-semibold text-white block">Preferred Video Quality</span>
                  <span className="text-xs text-neutral-400">Default playback resolution for supported streams</span>
                </div>
                <select
                  value={defaultQuality}
                  onChange={(e) => setDefaultQuality(e.target.value)}
                  className="bg-black/60 border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-neutral-200 focus:outline-none"
                >
                  <option value="4K">4K Ultra HD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="720p">720p HD</option>
                  <option value="auto">Auto Adaptive</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="text-sm font-semibold text-white block">Clear Local Playback Cache</span>
                  <span className="text-xs text-neutral-400">Reset saved playback positions and history cache</span>
                </div>
                <button
                  onClick={handleClearCache}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-red-500/40 text-xs font-semibold text-neutral-300 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
                >
                  <Database size={13} />
                  <span>{cacheCleared ? 'Cleared!' : 'Clear Cache'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Copyright & Intellectual Property Notice (កម្មសិទ្ធិបញ្ញា) */}
          <div className="bg-[#0e111f] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <ShieldAlert size={26} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Copyright & Intellectual Property Disclaimer (កម្មសិទ្ធិបញ្ញា)
                </h2>
                <p className="text-xs text-cyan-200/70 mt-1">
                  Legal compliance, content ownership statements, and DMCA takedown procedures.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed bg-black/40 border border-white/5 rounded-2xl p-5">
              <p>
                <strong>1. Non-Hosting & Indexing Notice:</strong> SC-ANIME KH operates exclusively as an index and search catalog of publicly accessible multimedia content across the web. None of the video media files, episodes, or audio streams are hosted, stored, uploaded, or transmitted directly on our servers.
              </p>
              <p>
                <strong>2. Rights Ownership:</strong> All trademarks, anime series, donghua titles, cover posters, character names, and original video content displayed on this website remain the sole intellectual property of their respective creators, animators, and official copyright holders, including but not limited to Tencent Penguin Pictures, Bilibili, Sparkly Key Animation, Youku, iQIYI, Toei Animation, and other production studios.
              </p>
              <p>
                <strong>3. Fair Use & Community Purpose:</strong> This platform is designed solely for entertainment, informational cataloging, and personal preview purposes. SC-ANIME KH encourages all users to support original production studios by subscribing to official platforms whenever available.
              </p>
              <p>
                <strong>4. DMCA & Content Removal Requests:</strong> If you are a copyright owner or an authorized agent and believe that content indexed on this platform infringes upon your copyright, please contact our administrative team. Upon receipt of a valid notice, infringing links will be promptly unindexed within 24–48 hours.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Mail size={15} className="text-cyan-400" />
                <span>DMCA Inquiries: <a href="mailto:dmca@sc-anime.com" className="text-cyan-400 hover:underline">dmca@sc-anime.com</a></span>
              </div>

              <a
                href="https://t.me/BongCheatz_IT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-bold bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-xl transition-all hover:scale-105"
              >
                <span>Contact Administrator on Telegram</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

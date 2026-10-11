'use client'

import Link from 'next/link'
import { Zap, Shield, Globe, Users, Crown, Send } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const FEATURES = [
  { icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/18', title: 'Instant Playback', desc: 'High-speed video servers with zero buffering in Full HD & 4K. Streams load in under 1 second.' },
  { icon: Globe, color: 'text-cyan-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'Live Catalog Updates', desc: 'New episodes from animekill.com appear on SC-ANIME KH automatically within 5 minutes of release.' },
  { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'Privacy First', desc: 'No tracking, no unnecessary data collection. Your watch history stays locally on your device.' },
  { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', title: 'Community Driven', desc: 'Built for the Cambodian anime community. Khmer subtitles and bilingual titles throughout.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-14">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-red-400/50 shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-cyan-500 via-sky-200 to-sky-600 bg-clip-text text-transparent">
              SC-ANIME KH
            </span>
          </h1>
          <p className="text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            The premier Cambodian streaming platform for Chinese Donghua, Japanese Anime, and Movies.
            Built for fans, powered by real live data, with zero compromise on quality.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`p-6 rounded-2xl border ${f.bg} bg-[#0d0f1a] flex items-start gap-4`}
            >
              <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}>
                <f.icon size={22} className={f.color} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{f.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-br from-[#0e111f] to-[#0c0e18] border border-cyan-500/18 rounded-3xl p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
            <Crown size={22} className="text-amber-400" /> Our Mission
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            SC-ANIME KH was created to make premium anime and donghua accessible to every Cambodian fan.
            We believe entertainment should be instant, high quality, and affordable.
          </p>
          <p className="text-neutral-300 leading-relaxed">
            Our $1 lifetime VIP plan is our commitment to that mission — world-class streaming at a price
            that respects our community.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <p className="text-neutral-400 text-sm mb-4">Questions? Reach our admin directly on Telegram.</p>
          <a
            href="https://t.me/BongCheatz_IT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0099e6] text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg"
          >
            <Send size={17} /> @BongCheatz_IT on Telegram
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}

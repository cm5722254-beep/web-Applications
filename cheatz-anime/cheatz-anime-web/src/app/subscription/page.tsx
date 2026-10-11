'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { subscriptionService } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui'
import { Crown, Check, Send, Sparkles, ShieldCheck, Zap, Film, Tv } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [activating, setActivating] = useState(false)
  const [activatedSuccess, setActivatedSuccess] = useState(false)

  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: subscriptionService.getStatus,
    enabled: !!user,
  })

  const isUserVip = Boolean(user?.subscribed || status?.subscribed || activatedSuccess)

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-5 uppercase tracking-wider">
            <Crown size={14} /> VIP LIFETIME ACCESS
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-sans">
            ជាវសមាជិក VIP មើលបានរហូត
          </h1>
          <p className="text-neutral-400 text-base font-sans">
            បង់ត្រឹមតែ <span className="text-amber-400 font-bold text-lg">$1</span> ម្តងគត់ — មើលបានរហូតគ្រប់រឿង
            ទាំងរឿងចិន ដុងហ្វ័រ ភាពយន្ត និងគំនូរជីវចល។
          </p>
        </div>

        {/* Active VIP Banner */}
        {isUserVip && (
          <div className="mb-10 p-6 bg-gradient-to-r from-emerald-950/40 via-[#0e111f] to-emerald-950/40 border border-emerald-500/40 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Check className="text-emerald-400" size={24} />
              </div>
              <div>
                <p className="text-emerald-400 font-bold text-lg font-sans flex items-center gap-2">
                  <Sparkles size={18} /> គណនី VIP របស់អ្នកសកម្ម!
                </p>
                <p className="text-neutral-400 text-sm font-sans">
                  ទស្សនាគ្រប់រឿងទាំងអស់ Full HD / 4K ដោយគ្មានដែនកំណត់។
                </p>
              </div>
            </div>
            <Link
              href="/anime"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all hover:scale-105 shrink-0 font-sans"
            >
              ចូលទស្សនា →
            </Link>
          </div>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Plan Card */}
          <div className="lg:col-span-7 relative bg-gradient-to-br from-[#0e111f] to-[#0c0e18] border border-amber-500/40 rounded-3xl p-7 sm:p-9 overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.12)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="absolute top-5 right-5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest shadow">
              Best Value
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <Crown size={24} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white font-sans">VIP ពេញមួយជីវិត</h2>
                <p className="text-neutral-500 text-xs uppercase tracking-wider">CHEATZ ANIME VIP PASS</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6 p-4 rounded-2xl bg-black/30 border border-white/5">
              <span className="text-5xl font-black text-amber-400">$1</span>
              <div>
                <p className="text-white/60 text-sm font-sans">ម្តងគត់</p>
                <p className="text-amber-400/70 text-xs font-sans">ទស្សនាបានពេញជីវិត</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {[
                'Only $1 — Lifetime access, no expiry',
                'All Anime, Donghua, Movies & Cartoon content',
                'Full HD 1080p & 4K Ultra HD streaming',
                'English subtitles included',
                '100% Ad-free viewing experience',
                'Early Access to new episodes',
                'Multi-device — watch on Phone, PC, Tablet',
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 text-sm font-sans text-white/90">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  {f}
                </div>
              ))}
            </div>

            {!isUserVip && (
              <div className="space-y-3 pt-5 border-t border-white/10">
                <a
                  href="https://t.me/BongCheatz_IT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold py-4 px-6 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:scale-[1.015] active:scale-[0.99] transition-all font-sans text-sm"
                >
                  <Send size={18} />
                  ទាក់ទងជាវ VIP ភ្លាមៗ ($1 ពេញជីវិត)
                </a>
                <p className="text-center text-xs text-neutral-500 font-sans">
                  ទាក់ទង Admin @BongCheatz_IT — ដំណើរការតែ ១ នាទី
                </p>
              </div>
            )}
          </div>

          {/* Telegram Guide */}
          <div className="lg:col-span-5 bg-gradient-to-b from-sky-950/40 to-[#0c0e18] border border-sky-500/30 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-rose-400">
                <Send size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-white font-sans">ទិញ VIP តាម Telegram</h3>
                <p className="text-xs text-rose-400 font-mono">@BongCheatz_IT</p>
              </div>
            </div>

            <p className="text-sm text-neutral-300 font-sans leading-relaxed mb-5">
              ទាក់ទង Admin ផ្ទាល់តាម Telegram ដើម្បីជាវ VIP ក្នុងតម្លៃ{' '}
              <span className="text-amber-400 font-bold">$1</span> ដោយវេរប្រាក់តាម KHQR, ABA, Bakong ឬ Wing។
            </p>

            <div className="space-y-3 bg-black/30 rounded-2xl p-4 border border-white/5 mb-5 font-sans text-xs text-neutral-300">
              {[
                'ចុចប៊ូតុង Telegram ខាងក្រោម',
                'វេរប្រាក់ $1 (KHQR / ABA / Wing / Bakong)',
                'ផ្ញើវិក្កយបត្រ → ទទួល VIP ភ្លាមៗ',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>

            <a
              href="https://t.me/BongCheatz_IT"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0099e6] text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-sky-500/20 font-sans"
            >
              <Send size={17} /> ផ្ញើសារ @BongCheatz_IT
            </a>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-5 text-xs text-neutral-500 font-sans">
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400" /> សុវត្ថិភាព</span>
              <span className="flex items-center gap-1.5"><Zap size={13} className="text-amber-400" /> ភ្លាមៗ</span>
            </div>
          </div>
        </div>

        {/* Feature showcase */}
        <div className="mt-16 pt-10 border-t border-white/5">
          <h3 className="text-xl font-extrabold text-center text-white mb-8 font-sans">
            VIP ផ្តល់ជូនអ្វីខ្លះ?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Film, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', title: 'ភាពយន្ត & Specials', desc: 'ទស្សនា Movie, OVA, Special ទាំងអស់ដោយសេរី' },
              { icon: Tv,   color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', title: 'Full HD & 4K', desc: 'រូបភាពច្បាស់ 1080p និង 4K Ultra HD' },
              { icon: Crown, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'គ្មានពាណិជ្ជកម្ម', desc: 'ទស្សនាជាប់ ១០០% No Ads No Interruptions' },
            ].map((item) => (
              <div key={item.title} className={`p-5 rounded-2xl border ${item.bg} bg-[#0d0f1a]`}>
                <item.icon className={`${item.color} mb-3`} size={24} />
                <h4 className="font-bold text-white font-sans mb-1.5">{item.title}</h4>
                <p className="text-xs text-neutral-400 font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

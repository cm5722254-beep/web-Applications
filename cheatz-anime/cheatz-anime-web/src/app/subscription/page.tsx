'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { subscriptionService } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner, ErrorMessage } from '@/components/ui'
import { Crown, Check, Send, Sparkles, ShieldCheck, Zap, Film, Tv } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [activating, setActivating] = useState(false)
  const [activatedSuccess, setActivatedSuccess] = useState(false)

  const { data: plans, isLoading, isError } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionService.getPlans,
  })

  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: subscriptionService.getStatus,
    enabled: !!user,
  })

  const isUserVip = Boolean(user?.subscribed || status?.subscribed || activatedSuccess)

  const handleInstantActivate = async () => {
    setActivating(true)
    try {
      await subscriptionService.activateVip()
      setActivatedSuccess(true)
      await refetchStatus()
      setTimeout(() => {
        window.location.reload()
      }, 800)
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4 uppercase tracking-wider">
            <Crown size={14} /> VIP LIFETIME ACCESS
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-khmer">
            ជាវសមាជិក VIP មើលបានរហូត
          </h1>
          <p className="text-brand-muted text-base font-khmer">
            បង់ត្រឹមតែ <span className="text-amber-400 font-bold text-lg">$1</span> ម្តងគត់ មើលបានរហូតគ្រប់រឿង
            ទាំងរឿងចិន ដុងហ្វ័រ ភាពយន្ត និងគំនូរជីវចល គ្មានការផ្សាយពាណិជ្ជកម្ម។
          </p>
        </div>

        {/* Current VIP Status Alert */}
        {isUserVip && (
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/20 via-green-500/15 to-emerald-500/20 border border-emerald-500/40 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Check className="text-emerald-400" size={24} />
              </div>
              <div>
                <p className="text-emerald-400 font-bold text-lg font-khmer flex items-center gap-2">
                  <Sparkles size={18} /> គណនីរបស់អ្នកគឺ VIP សកម្មពេញលេញ!
                </p>
                <p className="text-brand-muted text-sm font-khmer">
                  អ្នកអាចទស្សនាគ្រប់រឿងទាំងអស់ក្នុងកម្រិត Full HD / 4K ដោយគ្មានដែនកំណត់។
                </p>
              </div>
            </div>
            <Link
              href="/anime"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all font-khmer"
            >
              ចូលទស្សនាភ្លាមៗ
            </Link>
          </div>
        )}

        {/* Main VIP Pricing & Telegram Purchase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* VIP Plan Card (Left/Main - 7 cols) */}
          <div className="lg:col-span-7 bg-brand-surface/70 border border-amber-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
              Special Offer
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Crown size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-khmer">គម្រោង VIP ពេញមួយជីវិត</h2>
                <p className="text-brand-muted text-xs">CHEATZ ANIME VIP LIFETIME PASS</p>
              </div>
            </div>

            <div className="my-6 p-4 rounded-2xl bg-black/40 border border-white/5 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-amber-400">$1</span>
              <span className="text-white/60 text-sm font-khmer">/ ពេញមួយជីវិត (ទស្សនាបានរហូត)</span>
            </div>

            <div className="space-y-3 mb-8">
              {[
                'បង់តែ $1 មើលបានរហូតគ្រប់រឿង គ្មានផុតកំណត់',
                'ទស្សនារឿងភាពយន្ត និងរឿងភាគទាំងអស់ (Anime, Donghua, Movies)',
                'គុណភាពច្បាស់ត្រជាក់ភ្នែក Full HD 1080p & 4K',
                'មានអក្សររត់ពីក្រោមជាភាសាខ្មែរ (Khmer Subtitles)',
                'គ្មានការផ្សាយពាណិជ្ជកម្មរំខាន ១០០% (No Ads)',
                'ទស្សនាភាគថ្មីៗទាន់ចិត្តមុនគេបំផុត',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-white/90 font-khmer">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Real Purchase VIP Button via Telegram */}
            {!isUserVip && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <a
                  href="https://t.me/BongCheatz_IT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black py-4 rounded-xl font-extrabold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25 font-khmer"
                >
                  <Send size={18} />
                  <span>ទាក់ទងជាវ VIP ឥឡូវនេះ ($1 ពេញមួយជីវិត)</span>
                </a>
                <p className="text-center text-xs text-brand-muted font-khmer">
                  ទាក់ទង Admin តាម Telegram @BongCheatz_IT ដើម្បីបើកសិទ្ធិ VIP ភ្លាមៗ
                </p>
              </div>
            )}
          </div>

          {/* Official Telegram Purchase Guide (Right - 5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#1c2438] to-[#111726] border border-sky-500/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0088cc]/20 border border-[#0088cc]/40 flex items-center justify-center text-[#29b6f6]">
                <Send size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-khmer">ទិញ VIP តាម TELEGRAM</h3>
                <p className="text-xs text-sky-400 font-mono">@BongCheatz_IT</p>
              </div>
            </div>

            <p className="text-sm text-white/80 font-khmer leading-relaxed">
              ដើម្បីទិញគណនី VIP សូមទាក់ទងមកកាន់ Telegram Admin ផ្លូវការផ្ទាល់។ Admin នឹងបើកសិទ្ធិ VIP ជូនលោកអ្នកក្នុងរយៈពេលត្រឹមតែ <span className="text-amber-400 font-bold">១ នាទី</span>!
            </p>

            <div className="space-y-3 bg-black/30 p-4 rounded-2xl border border-white/5 font-khmer text-xs text-white/80">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">1</span>
                <span>ចុចប៊ូតុង Telegram ខាងក្រោមដើម្បីឆាតទៅកាន់ Admin</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">2</span>
                <span>វេរប្រាក់ត្រឹមតែ <strong>$1</strong> តាមរយៈ KHQR, ABA, Bakong ឬ Wing</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">3</span>
                <span>ផ្ញើវិក្កយបត្រមក Admin ដើម្បីទទួលបាន VIP រហូតភ្លាមៗ</span>
              </div>
            </div>

            {/* Telegram Contact CTA */}
            <a
              href="https://t.me/BongCheatz_IT"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#0088cc] hover:bg-[#0099e6] text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] font-khmer"
            >
              <Send size={18} />
              ផ្ញើសារទៅ Admin: @BongCheatz_IT
            </a>

            {/* Security Badges */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-4 text-xs text-white/50 font-khmer">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" /> សុវត្ថិភាព ១០០%
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" /> ដំណើរការភ្លាមៗ
              </span>
            </div>
          </div>
        </div>

        {/* Features Comparison / Showcase */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h3 className="text-xl font-bold text-center text-white mb-8 font-khmer">
            ភាពខុសគ្នារវាងគណនីធម្មតា និង គណនី VIP
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-brand-surface border border-white/5 space-y-2">
              <Film className="text-amber-400" size={24} />
              <h4 className="font-bold text-white font-khmer">រឿងភាពយន្ត និង Specials</h4>
              <p className="text-xs text-brand-muted font-khmer">
                ទស្សនារឿងប្រភេទភាពយន្ត Movie Theatrical Releases ទាំងអស់ដោយសេរី។
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-brand-surface border border-white/5 space-y-2">
              <Tv className="text-purple-400" size={24} />
              <h4 className="font-bold text-white font-khmer">កម្រិតច្បាស់ Full HD & 4K</h4>
              <p className="text-xs text-brand-muted font-khmer">
                រីករាយជាមួយរូបភាពច្បាស់ម៉ត់ និងសំឡេងច្បាស់ល្អ មិនទាក់ មិនរអាក់រអួល។
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-brand-surface border border-white/5 space-y-2">
              <Crown className="text-emerald-400" size={24} />
              <h4 className="font-bold text-white font-khmer">គ្មានពាណិជ្ជកម្ម</h4>
              <p className="text-xs text-brand-muted font-khmer">
                ទស្សនាជាប់រហូត គ្មានផ្ទាំងពាណិជ្ជកម្មលោតរំខានអារម្មណ៍ឡើយ។
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

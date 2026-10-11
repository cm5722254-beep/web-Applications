'use client'

import { X, Crown, Check, Sparkles, Zap, Shield, Star } from 'lucide-react'
import Link from 'next/link'

interface VIPUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  animeTitle?: string
}

export function VIPUpgradeModal({ isOpen, onClose, animeTitle }: VIPUpgradeModalProps) {
  if (!isOpen) return null

  const benefits = [
    { icon: Crown, text: 'រឿងVIP ទាំងអស់គ្មានដែនកំណត់', color: 'text-amber-400' },
    { icon: Sparkles, text: 'គុណភាពវីដេអូ HD & FHD', color: 'text-cyan-400' },
    { icon: Zap, text: 'មើលមុនគេ - episodes ថ្មីមុនគេ', color: 'text-purple-400' },
    { icon: Shield, text: 'គ្មានផ្សាយពាណិជ្ជកម្ម', color: 'text-emerald-400' },
    { icon: Star, text: 'Download episodes ដើម្បីមើលក្រៅ Offline', color: 'text-rose-400' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-[#0d0f1a] via-[#1a1c2e] to-[#0d0f1a] border border-amber-500/30 rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-300">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)]">
              <Crown size={40} className="text-black" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              VIP Content ដែលផ្តាច់មុខ
            </h2>
            {animeTitle && (
              <p className="text-neutral-400 text-sm">
                <strong className="text-white">"{animeTitle}"</strong> គឺជារឿង VIP Premium
              </p>
            )}
            <p className="text-neutral-300 text-sm leading-relaxed">
              Upgrade ទៅ SC-ANIME VIP ដើម្បីមើលរឿងនេះ និងរឿងផ្សេងទៀតជាង 500+ រឿង!
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors"
              >
                <div className={`shrink-0 ${benefit.color}`}>
                  <benefit.icon size={20} />
                </div>
                <p className="text-sm text-neutral-200 font-medium">
                  {benefit.text}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <Link
              href="/subscribe"
              className="block w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black text-center font-extrabold text-base shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.7)] transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center gap-2">
                <Crown size={20} className="fill-current" />
                <span>Upgrade ទៅ VIP ឥឡូវនេះ</span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="block w-full py-3 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 hover:text-white text-center font-semibold text-sm transition-colors"
            >
              មើលរឿងឥតគិតថ្លៃ ជំនួសវិញ
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-neutral-500 pt-2">
            💳 គាំទ្រការទូទាត់តាមរយៈ Credit Card, ABA Pay, Wing
          </p>
        </div>
      </div>
    </div>
  )
}

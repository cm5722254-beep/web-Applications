'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  Heart, QrCode, Copy, Check, Sparkles, Coffee,
  Gift, Star, ArrowLeft, Zap, Crown
} from 'lucide-react'

export default function DonatePage() {
  const [copied, setCopied] = useState(false)
  const ADMIN_NAME = 'SOCHEAT VINCHAN'
  const ADMIN_ID = 'socheatvinchan@gmail.com'

  const handleCopy = () => {
    navigator.clipboard.writeText(ADMIN_ID).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-cyan-300 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-full px-4 py-2 mb-6">
            <Heart size={16} className="text-pink-400 fill-pink-400 animate-pulse" />
            <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">
              Support SC-ANIME KH
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 leading-none">
            <span className="block text-white">គាំទ្រ</span>
            <span className="block bg-gradient-to-r from-pink-400 via-red-400 to-rose-400 bg-clip-text text-transparent">
              SC-ANIME KH 🇰🇭
            </span>
          </h1>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            ការ donate របស់អ្នកជួយឲ្យ SC-ANIME KH បន្តផ្តល់សេវា streaming ឥតគិតថ្លៃ
            <br />
            សម្រាប់សហគមន៍ Anime & Donghua ខ្មែរទាំងមូល 💙
          </p>
        </div>

        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-[#0d0f1a] via-[#0a0c18] to-[#06080f] border border-pink-500/25 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(236,72,153,0.15)] mb-8">
          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-600 via-red-400 to-rose-600" />

          {/* Background glow blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-10">
            <div className="grid lg:grid-cols-2 gap-10 items-center">

              {/* Left: QR Code */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  {/* Animated glow ring */}
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-pink-500/30 via-red-400/20 to-rose-600/30 blur-xl opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
                  
                  {/* QR Card */}
                  <div className="relative bg-white p-6 rounded-3xl shadow-2xl border-4 border-pink-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/khqr.png"
                      alt="KHQR Donation QR Code"
                      className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                      draggable={false}
                    />
                  </div>

                  {/* Floating KHQR badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl px-4 py-2 shadow-lg rotate-6 group-hover:rotate-12 transition-transform">
                    <span className="text-white font-black text-sm tracking-tight">KHQR</span>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-neutral-400 flex items-center justify-center gap-2">
                    <QrCode size={16} className="text-pink-400" />
                    Scan with any Khmer banking app
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['ABA', 'ACLEDA', 'Wing', 'Pi Pay', 'TrueMoney'].map(bank => (
                      <span key={bank}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300">
                        {bank}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Info & Actions */}
              <div className="space-y-6">
                {/* Recipient Info */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                      <Crown size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Donate to</p>
                      <p className="text-white font-extrabold text-lg">{ADMIN_NAME}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider font-semibold">ABA Account ID</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-pink-300 font-mono text-sm bg-pink-500/10 border border-pink-500/25 px-4 py-3 rounded-xl truncate">
                        {ADMIN_ID}
                      </code>
                      <button
                        onClick={handleCopy}
                        className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30 hover:bg-pink-500/30 text-pink-300 transition-all shrink-0 hover:scale-105"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <Check size={18} className="text-emerald-400" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-emerald-400 text-xs mt-2 font-semibold animate-slide-up">
                        ✓ Copied successfully!
                      </p>
                    )}
                  </div>
                </div>

                {/* Suggested Amounts */}
                <div>
                  <p className="text-sm text-neutral-400 font-semibold mb-3 flex items-center gap-2">
                    <Gift size={16} className="text-pink-400" />
                    💝 ចំនួនដែលពេញនិយម
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { usd: '$1', riel: '4,000៛', label: '☕', desc: 'Coffee' },
                      { usd: '$5', riel: '20,000៛', label: '🍜', desc: 'Noodle' },
                      { usd: '$10', riel: '40,000៛', label: '🎁', desc: 'Gift' },
                    ].map(amt => (
                      <div key={amt.usd}
                        className="group bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/25 hover:border-pink-400/50 rounded-2xl p-4 text-center cursor-default transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                        <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{amt.label}</div>
                        <p className="text-white font-black text-lg">{amt.usd}</p>
                        <p className="text-pink-300 text-xs font-semibold">{amt.riel}</p>
                        <p className="text-neutral-500 text-[10px] mt-1">{amt.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thank you note */}
                <div className="bg-gradient-to-r from-pink-950/50 to-red-950/30 border border-pink-500/20 rounded-2xl p-5 flex items-start gap-3">
                  <Sparkles size={20} className="text-pink-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="text-white font-bold text-sm mb-1">អរគុណពីចិត្ត 🙏</p>
                    <p className="text-neutral-400 text-xs leading-relaxed">
                      ការ donate របស់អ្នកជួយឲ្យយើងរក្សា server, bandwidth, និង
                      content license ដើម្បីផ្តល់ការ streaming ឥតគិតថ្លៃជូនសមាជិក។
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Zap,
              color: 'from-yellow-500 to-orange-500',
              title: 'Server Costs',
              desc: 'រក្សា server streaming ល្បឿនលឿន',
            },
            {
              icon: Star,
              color: 'from-blue-500 to-cyan-500',
              title: 'Content License',
              desc: 'ទិញ license anime & donghua ថ្មីៗ',
            },
            {
              icon: Crown,
              color: 'from-purple-500 to-pink-500',
              title: 'Free Forever',
              desc: 'រក្សាសេវាឥតគិតថ្លៃជារៀងរហូត',
            },
          ].map((benefit, i) => (
            <div key={i}
              className="bg-[#0d0f1a] border border-white/10 hover:border-pink-500/30 rounded-2xl p-6 text-center transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)]">
              <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center`}>
                <benefit.icon size={28} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-base mb-1">{benefit.title}</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-[#0d0f1a] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Coffee size={20} className="text-pink-400" />
            សំណួរញឹកញាប់
          </h2>
          <div className="space-y-4 text-sm">
            {[
              {
                q: 'តើខ្ញុំធ្វើ donate តាមរយៈ app អ្វីខ្លះបាន?',
                a: 'គ្រប់ banking app ខ្មែរទាំងអស់: ABA, ACLEDA, Wing, Pi Pay, TrueMoney, Chip Mong Bank។ គ្រាន់តែ scan QR code។',
              },
              {
                q: 'តើការ donate មានអត្ថប្រយោជន៍យ៉ាងម៉េច?',
                a: 'ជួយរក្សា server streaming, bandwidth costs, content licensing, និង development team ដើម្បីរក្សាសេវាឥតគិតថ្លៃ។',
              },
              {
                q: 'តើខ្ញុំចាំបាច់ត្រូវ donate ទេ?',
                a: 'ទេ! SC-ANIME KH ឥតគិតថ្លៃ 100%។ ប៉ុន្តែការ donate ជួយយើងបន្តផ្តល់សេវាល្អប្រសើរ។',
              },
            ].map((faq, i) => (
              <div key={i} className="border-l-2 border-pink-500/30 pl-4">
                <p className="text-white font-semibold mb-1">{faq.q}</p>
                <p className="text-neutral-400 text-xs leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

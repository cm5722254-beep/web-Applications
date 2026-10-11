'use client'

import { Send, MessageCircle, Mail, ShieldCheck } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-14">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Contact Us</h1>
          <p className="text-neutral-400 text-sm sm:text-base">
            Have a question, report an issue, or want to request a series? Reach out below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {/* Telegram */}
          <a
            href="https://t.me/BongCheatz_IT"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 p-6 bg-[#0e111f] border border-sky-500/20 hover:border-sky-500/50 rounded-2xl transition-all hover:bg-sky-500/5"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Send size={22} className="text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Telegram (Fastest)</h3>
              <p className="text-sky-400 text-sm font-mono">@BongCheatz_IT</p>
              <p className="text-neutral-400 text-xs mt-1.5">VIP purchase, episode requests, tech support</p>
            </div>
          </a>

          {/* DMCA */}
          <a
            href="mailto:dmca@sc-anime.kh"
            className="group flex items-start gap-4 p-6 bg-[#0e111f] border border-red-500/20 hover:border-red-500/50 rounded-2xl transition-all hover:bg-red-500/5"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ShieldCheck size={22} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">DMCA / Copyright</h3>
              <p className="text-red-400 text-sm">dmca@sc-anime.kh</p>
              <p className="text-neutral-400 text-xs mt-1.5">Copyright takedown requests & legal notices</p>
            </div>
          </a>
        </div>

        {/* Disclaimer Box */}
        <div className="bg-[#0e111f] border border-white/5 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-cyan-400" /> Platform Notice
          </h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            SC-ANIME KH does not host any video files on its own servers. All streams are sourced from
            publicly available third-party video platforms. If you are a content owner and wish to
            request removal of a specific series, please contact us via the DMCA channel above and we
            will process your request within 48 hours.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

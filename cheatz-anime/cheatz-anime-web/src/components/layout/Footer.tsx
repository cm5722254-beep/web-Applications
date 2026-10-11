import Link from 'next/link'
import { ShieldAlert, Calendar, Compass, Send } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#0a0608] border-t border-red-500/15 mt-20 relative overflow-hidden">
      {/* Red glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
      <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-red-600/4 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-red-500/50 shadow-[0_0_14px_rgba(225,29,72,0.35)] group-hover:scale-105 transition-all">
                <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center font-black text-xl tracking-wider">
                <span className="bg-gradient-to-r from-red-400 via-rose-300 to-red-500 bg-clip-text text-transparent">
                  SC-ANIME
                </span>
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                  KH
                </span>
              </div>
            </Link>

            <p className="text-rose-100/50 text-sm leading-relaxed max-w-md">
              The premier streaming catalog for high-definition Chinese Donghua, Japanese Anime, and Movies.
              Ultra-fast playback in Full HD & 4K.
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              {['Chinese Donghua', 'Japanese Anime', '4K Ultra HD', 'Weekly Schedule', 'Instant Stream'].map((tag) => (
                <span key={tag}
                  className="text-[11px] font-semibold text-rose-100/40 bg-red-500/8 border border-red-500/15 px-2.5 py-1 rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-red-400 font-bold mb-3.5 text-xs uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/anime?type=donghua', label: 'Chinese Donghua' },
                { href: '/anime?type=anime',   label: 'Japanese Anime' },
                { href: '/movies',             label: 'Anime Movies' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-rose-100/45 hover:text-red-300 transition-colors">{l.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/schedule" className="text-rose-100/45 hover:text-red-300 transition-colors flex items-center gap-1.5">
                  <Calendar size={12} className="text-amber-400" /> Release Schedule
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-rose-100/45 hover:text-red-300 transition-colors flex items-center gap-1.5">
                  <Compass size={12} /> Browse Genres
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-red-400 font-bold mb-3.5 text-xs uppercase tracking-wider">Legal & Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/settings" className="text-rose-100/45 hover:text-red-300 transition-colors flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-red-400" /> Copyright & DMCA
                </Link>
              </li>
              {[
                { href: '/terms',   label: 'Terms of Service' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/about',   label: 'About' },
                { href: '/contact', label: 'Contact' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-rose-100/45 hover:text-red-300 transition-colors">{l.label}</Link>
                </li>
              ))}
              <li>
                <a href="https://t.me/BongCheatz_IT" target="_blank" rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1.5">
                  <Send size={12} /> Telegram Admin
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-red-500/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-rose-100/30">
          <p>© 2026 SC-ANIME KH. All rights reserved.</p>
          <p className="text-center md:text-right max-w-xl">
            Disclaimer: This platform does not host any media files on its servers. All streams are indexed from third-party public web services.
          </p>
        </div>
      </div>
    </footer>
  )
}

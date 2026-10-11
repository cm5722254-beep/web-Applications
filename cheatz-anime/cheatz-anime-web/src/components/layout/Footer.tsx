import Link from 'next/link'
import { ShieldAlert, Calendar, Film, Compass, Heart, Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#07080f] border-t border-cyan-500/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center font-black text-xl tracking-wider">
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  SC-ANIME
                </span>
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  KH
                </span>
              </div>
            </Link>

            <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
              The premier streaming catalog for high-definition Chinese Donghua, Japanese Anime, and Movies. Ultra-fast playback in Full HD & 4K.
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              {['Chinese Donghua', 'Japanese Anime', '4K Ultra HD', 'Weekly Schedule', 'Instant Stream'].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold text-neutral-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h3 className="text-white font-bold mb-3.5 text-sm uppercase tracking-wider text-cyan-400">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/anime?type=donghua" className="text-neutral-400 hover:text-cyan-400 transition-colors">
                  Chinese Donghua
                </Link>
              </li>
              <li>
                <Link href="/anime?type=anime" className="text-neutral-400 hover:text-cyan-400 transition-colors">
                  Japanese Anime
                </Link>
              </li>
              <li>
                <Link href="/movies" className="text-neutral-400 hover:text-cyan-400 transition-colors">
                  Anime Movies
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-neutral-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-400" />
                  <span>Release Schedule</span>
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-neutral-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Compass size={13} />
                  <span>Browse Genres</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Account */}
          <div>
            <h3 className="text-white font-bold mb-3.5 text-sm uppercase tracking-wider text-cyan-400">
              Legal & Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/settings" className="text-neutral-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-cyan-400" />
                  <span>Copyright & DMCA Notice</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-400 hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral-400 hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="https://t.me/BongCheatz_IT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  Telegram Admin Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 SC-ANIME KH. All rights reserved.</p>
          <p className="text-center md:text-right max-w-xl">
            Disclaimer: This platform does not host any media files on its servers. All streams and artwork are indexed from third-party public web services.
          </p>
        </div>
      </div>
    </footer>
  )
}

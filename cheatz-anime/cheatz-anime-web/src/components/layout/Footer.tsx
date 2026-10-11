import Link from 'next/link'

const EXPLORE_LINKS = [
  { href: '/anime?type=donghua', label: 'Chinese Donghua' },
  { href: '/anime?type=anime',   label: 'Japanese Anime'  },
  { href: '/movies',             label: 'Movies'          },
  { href: '/popular',            label: 'Popular'         },
  { href: '/latest',             label: 'Latest'          },
]

const INFO_LINKS = [
  { href: '/about',   label: 'About'        },
  { href: '/contact', label: 'Contact'      },
  { href: '/terms',   label: 'Terms of Use' },
  { href: '/privacy', label: 'Privacy'      },
]

const GENRE_TAGS = [
  'Cultivation', 'Martial Arts', 'Rebirth', 'Overpowered MC',
  'Monster Evolution', 'Fantasy', 'Action', 'Adventure',
]

export function Footer() {
  return (
    <footer className="bg-[#07080f] border-t border-white/5 mt-20 relative overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      <div className="absolute top-0 left-1/4 w-[400px] h-[180px] bg-cyan-600/3 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-cyan-400/35 shadow-[0_0_12px_rgba(0,212,255,0.25)] group-hover:ring-cyan-400/60 transition-all">
                <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1 font-black text-lg tracking-wide">
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  SC-ANIME
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/25">
                  KH
                </span>
              </div>
            </Link>

            <p className="text-neutral-500 text-sm leading-relaxed">
              The premier streaming catalog for Chinese Donghua, Japanese Anime, and Movies in Full HD &amp; 4K.
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {GENRE_TAGS.slice(0, 4).map((tag) => (
                <span key={tag} className="text-[10px] font-semibold text-cyan-300/50 bg-cyan-500/6 border border-cyan-500/12 px-2 py-0.5 rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-cyan-400/70 font-bold mb-3.5 text-[11px] uppercase tracking-widest">Explore</h3>
            <ul className="space-y-2">
              {EXPLORE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-neutral-400 hover:text-cyan-300 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-cyan-400/70 font-bold mb-3.5 text-[11px] uppercase tracking-widest">Info</h3>
            <ul className="space-y-2">
              {INFO_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-neutral-400 hover:text-cyan-300 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-cyan-400/70 font-bold mb-3.5 text-[11px] uppercase tracking-widest">Genres</h3>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_TAGS.map((tag) => (
                <Link
                  key={tag}
                  href={`/genres?q=${encodeURIComponent(tag.toLowerCase())}`}
                  className="text-[10px] font-semibold text-neutral-400 hover:text-cyan-300 bg-white/3 hover:bg-cyan-500/8 border border-white/6 hover:border-cyan-500/20 px-2 py-1 rounded-lg transition-all"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <span>© {new Date().getFullYear()} SC-ANIME KH. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms"   className="hover:text-neutral-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-neutral-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

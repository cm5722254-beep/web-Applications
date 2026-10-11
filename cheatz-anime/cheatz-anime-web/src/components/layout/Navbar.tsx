'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Search, Menu, X, User, LogOut, History, Heart,
  Settings, Calendar, Flame, Film, Compass, ShieldCheck,
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/',               label: 'Home'     },
  { href: '/anime?type=donghua', label: 'Donghua' },
  { href: '/anime?type=anime',   label: 'Anime'   },
  { href: '/movies',         label: 'Movies'   },
  { href: '/schedule',       label: 'Schedule' },
  { href: '/genres',         label: 'Genres'   },
]

export function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen]         = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [query, setQuery]               = useState('')
  const userRef  = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
      setSearchOpen(false)
      setQuery('')
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#07080f]/95 backdrop-blur-2xl border-b border-white/6 shadow-[0_1px_30px_rgba(0,0,0,0.6)]">
      {/* Top cyan accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Brand ─────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-cyan-400/40 shadow-[0_0_14px_rgba(0,212,255,0.3)] group-hover:ring-cyan-400/70 group-hover:shadow-[0_0_22px_rgba(0,212,255,0.5)] transition-all duration-300">
              <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1 font-black text-[17px] tracking-wide">
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  SC-ANIME
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/25">
                  KH
                </span>
              </div>
              <span className="text-[8.5px] uppercase tracking-widest text-cyan-200/35 font-semibold">
                Donghua · Anime · 4K
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-cyan-300 hover:bg-cyan-500/8 transition-all duration-200 whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right Actions ─────────────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 animate-scale-in">
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anime..."
                  className="bg-white/5 border border-white/12 rounded-xl px-3 py-1.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 w-44 transition-all"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setQuery('') }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-neutral-400 hover:text-cyan-300 hover:bg-cyan-500/8 transition-all duration-200"
                aria-label="Search"
              >
                <Search size={19} />
              </button>
            )}

            {/* User */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all duration-200 group"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full ring-1 ring-cyan-400/40 group-hover:ring-cyan-400/70 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm ring-1 ring-cyan-500/30">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0d0f1a]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-white/6">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-[9px] text-cyan-300 font-bold mt-1">
                          <ShieldCheck size={9} /> Admin Access
                        </span>
                      )}
                    </div>

                    {[
                      { href: '/profile',   icon: User,     label: 'My Profile'   },
                      { href: '/history',   icon: History,  label: 'Watch History' },
                      { href: '/favorites', icon: Heart,    label: 'Favorites'    },
                      { href: '/schedule',  icon: Calendar, label: 'Schedule'     },
                      { href: '/settings',  icon: Settings, label: 'Settings'     },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-cyan-500/8 transition-all"
                      >
                        <Icon size={15} className="text-neutral-500" />
                        {label}
                      </Link>
                    ))}

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/8 transition-all"
                      >
                        <ShieldCheck size={15} />
                        Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-white/6 mt-1">
                      <button
                        onClick={() => { setUserMenuOpen(false); logout() }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-all"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-[0_0_14px_rgba(0,180,216,0.3)] hover:shadow-[0_0_22px_rgba(0,180,216,0.5)]"
              >
                <User size={15} />
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────────── */}
        {menuOpen && (
          <div className="lg:hidden border-t border-white/6 py-3 space-y-0.5 animate-slide-up">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-300 hover:text-cyan-300 hover:bg-cyan-500/8 transition-all"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-cyan-400 hover:bg-cyan-500/8 rounded-xl transition-all"
              >
                <User size={15} />
                Sign In with Google
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

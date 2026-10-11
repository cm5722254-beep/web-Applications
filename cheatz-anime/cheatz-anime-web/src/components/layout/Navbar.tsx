'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Search, Menu, X, Crown, User, LogOut, History, Heart,
  Settings, Calendar, Flame, Sparkles, Film, Compass, Sun, Moon, ShieldCheck,
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0608]/92 backdrop-blur-2xl border-b border-red-500/20 shadow-[0_2px_40px_rgba(225,29,72,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand ────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-red-500/60 shadow-[0_0_18px_rgba(225,29,72,0.45)] group-hover:scale-105 transition-all">
              <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center font-black text-xl tracking-wider leading-none">
                <span className="bg-gradient-to-r from-red-400 via-rose-300 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(225,29,72,0.6)]">
                  SC-ANIME
                </span>
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                  KH
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-rose-200/50 font-semibold mt-0.5">
                Donghua • Anime • 4K
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────────── */}
          <div className="hidden xl:flex items-center gap-0.5">
            {[
              { href: '/', label: 'Home' },
              { href: '/anime?type=donghua', label: 'Donghua' },
              { href: '/anime?type=anime', label: 'Anime' },
              { href: '/movies', label: 'Movies' },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="px-3 py-1.5 text-rose-100/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium">
                {link.label}
              </Link>
            ))}
            <Link href="/schedule"
              className="px-3 py-1.5 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg transition-all text-sm font-semibold flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" /> Schedule
            </Link>
            <Link href="/genres"
              className="px-3 py-1.5 text-rose-100/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium flex items-center gap-1">
              <Compass size={14} /> Genres
            </Link>
            <Link href="/latest"
              className="px-3 py-1.5 text-rose-100/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium flex items-center gap-1">
              <Sparkles size={14} /> Latest
            </Link>
            <Link href="/popular"
              className="px-3 py-1.5 text-rose-100/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium flex items-center gap-1">
              <Flame size={14} /> Popular
            </Link>
            <Link href="/az-list"
              className="px-2.5 py-1.5 text-rose-100/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium">
              A-Z
            </Link>
          </div>

          {/* ── Right Actions ─────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link href="/search"
              className="p-2 text-rose-100/60 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/30"
              title="Search Anime">
              <Search size={18} />
            </Link>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="p-2 text-rose-100/50 hover:text-red-300 transition-colors border border-white/5 rounded-xl hover:border-red-500/30 bg-white/3"
              title="Toggle Theme">
              {theme === 'dark'
                ? <Sun size={16} className="text-amber-400" />
                : <Moon size={16} className="text-red-300" />}
            </button>

            {/* Admin badge */}
            {isAdmin && (
              <Link href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(225,29,72,0.45)] hover:scale-105 transition-all">
                <Crown size={12} /> ADMIN
              </Link>
            )}

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-rose-100/80 hover:text-red-300 transition-colors p-1 rounded-xl hover:bg-white/5">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-red-500/50 shadow-[0_0_10px_rgba(225,29,72,0.35)]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-xs font-black text-white shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:flex flex-col items-start text-left">
                    <span className="max-w-[100px] truncate text-xs font-semibold leading-tight">{user.name}</span>
                    <span className="text-[10px] text-red-400 font-bold flex items-center gap-0.5">
                      <Crown size={9} /> VIP Member
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-[#130a0b]/95 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl shadow-black/80 py-2 z-50">
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent rounded-t-2xl" />

                    <div className="px-4 py-2.5 border-b border-white/5 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-rose-200/50 truncate">{user.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 rounded px-2 py-0.5 font-bold">
                        <Crown size={9} /> Active VIP
                      </span>
                    </div>

                    {[
                      { href: '/profile', icon: User, label: 'My Profile' },
                      { href: '/history', icon: History, label: 'Watch History' },
                      { href: '/favorites', icon: Heart, label: 'Saved Favorites' },
                      { href: '/settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                      <Link key={item.href} href={item.href}
                        className="flex items-center gap-3 px-4 py-2 text-xs text-rose-100/70 hover:text-red-300 hover:bg-red-500/8 transition-colors"
                        onClick={() => setUserMenuOpen(false)}>
                        <item.icon size={14} /> {item.label}
                      </Link>
                    ))}

                    <div className="border-t border-white/5 my-1" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold px-4 py-1.5 rounded-xl text-xs shadow-[0_0_15px_rgba(225,29,72,0.45)] transition-all hover:scale-105">
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="xl:hidden p-2 text-rose-100/60 hover:text-red-300 transition-colors ml-1"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────────────────── */}
        {menuOpen && (
          <div className="xl:hidden border-t border-red-500/10 py-3 space-y-0.5 bg-[#0a0608]/98 backdrop-blur-2xl">
            {[
              { href: '/', label: 'Home' },
              { href: '/anime?type=donghua', label: 'Donghua (Chinese Anime)' },
              { href: '/anime?type=anime', label: 'Anime (Japanese)' },
              { href: '/movies', label: 'Movies' },
            ].map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-rose-100/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all">
                {link.label}
              </Link>
            ))}
            <Link href="/schedule" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/10 rounded-lg font-semibold">
              <Calendar size={15} /> Release Schedule
            </Link>
            <Link href="/genres" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-rose-100/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg">
              <Compass size={15} /> Browse Genres
            </Link>
            <Link href="/latest" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-rose-100/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg">
              <Sparkles size={15} /> Latest Episodes
            </Link>
            <Link href="/popular" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-rose-100/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg">
              <Flame size={15} /> Trending & Popular
            </Link>
            <Link href="/settings" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-rose-100/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg">
              <ShieldCheck size={15} /> Settings & Copyright
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

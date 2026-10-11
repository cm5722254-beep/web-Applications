'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Search,
  Menu,
  X,
  Crown,
  User,
  LogOut,
  History,
  Heart,
  Settings,
  Calendar,
  Flame,
  Sparkles,
  Film,
  Compass,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-[#07080f]/95 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-all">
              <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center font-black text-xl tracking-wider leading-none">
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
                  SC-ANIME
                </span>
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  KH
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-cyan-200/60 font-semibold mt-0.5">
                Donghua • Anime • 4K
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-neutral-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/anime?type=donghua"
              className="px-3 py-1.5 text-neutral-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all text-sm font-medium"
            >
              Donghua
            </Link>
            <Link
              href="/anime?type=anime"
              className="px-3 py-1.5 text-neutral-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all text-sm font-medium"
            >
              Anime
            </Link>
            <Link
              href="/movies"
              className="px-3 py-1.5 text-neutral-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all text-sm font-medium"
            >
              Movies
            </Link>
            <Link
              href="/schedule"
              className="px-3 py-1.5 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg transition-all text-sm font-semibold flex items-center gap-1.5"
            >
              <Calendar size={15} className="text-amber-400" />
              <span>Schedule</span>
            </Link>
            <Link
              href="/genres"
              className="px-3 py-1.5 text-neutral-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all text-sm font-medium flex items-center gap-1"
            >
              <Compass size={15} />
              <span>Genres</span>
            </Link>
            <Link
              href="/latest"
              className="px-3 py-1.5 text-neutral-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all text-sm font-medium flex items-center gap-1"
            >
              <Sparkles size={15} />
              <span>Latest</span>
            </Link>
            <Link
              href="/popular"
              className="px-3 py-1.5 text-neutral-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all text-sm font-medium flex items-center gap-1"
            >
              <Flame size={15} />
              <span>Popular</span>
            </Link>
            <Link
              href="/az-list"
              className="px-2.5 py-1.5 text-neutral-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all text-sm font-medium"
            >
              A-Z
            </Link>
          </div>

          {/* Right Section Actions */}
          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <Link
              href="/search"
              className="p-2 text-neutral-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all border border-transparent hover:border-cyan-500/30"
              title="Search Anime"
            >
              <Search size={18} />
            </Link>

            {/* Dark/Light Mode */}
            <button
              onClick={toggleTheme}
              className="p-2 text-neutral-400 hover:text-cyan-400 transition-colors border border-white/10 rounded-xl hover:border-cyan-400/40 bg-white/5"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-cyan-400" />}
            </button>

            {/* Admin Badge */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:scale-105 transition-all"
              >
                <Crown size={13} />
                <span>ADMIN</span>
              </Link>
            )}

            {/* User Profile or Login */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-neutral-200 hover:text-cyan-400 transition-colors p-1 rounded-xl hover:bg-white/5"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:flex flex-col items-start text-left">
                    <span className="max-w-[100px] truncate text-xs font-semibold leading-tight">{user.name}</span>
                    <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                      <Crown size={9} /> VIP Member
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-[#0c0e18] border border-cyan-500/30 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl">
                    <div className="px-4 py-2.5 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded px-2 py-0.5 font-bold">
                        <Crown size={10} /> Active VIP
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-xs text-neutral-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={15} /> My Profile
                    </Link>
                    <Link
                      href="/history"
                      className="flex items-center gap-3 px-4 py-2 text-xs text-neutral-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <History size={15} /> Watch History
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-4 py-2 text-xs text-neutral-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Heart size={15} /> Saved Favorites
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-xs text-neutral-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={15} /> Settings & Copyright
                    </Link>

                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold px-4 py-1.5 rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
              >
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="xl:hidden p-2 text-neutral-300 hover:text-cyan-400 transition-colors ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <div className="xl:hidden border-t border-white/10 py-3 space-y-1 bg-[#07080f]/98 backdrop-blur-2xl">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/anime?type=donghua"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Donghua (Chinese Anime)
            </Link>
            <Link
              href="/anime?type=anime"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Anime (Japanese)
            </Link>
            <Link
              href="/movies"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Movies
            </Link>
            <Link
              href="/schedule"
              className="flex items-center gap-2 px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/10 rounded-lg font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              <Calendar size={16} /> Release Schedule
            </Link>
            <Link
              href="/genres"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              <Compass size={16} /> Browse Genres
            </Link>
            <Link
              href="/latest"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              <Sparkles size={16} /> Latest Episodes
            </Link>
            <Link
              href="/popular"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              <Flame size={16} /> Trending & Popular
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              <ShieldCheck size={16} /> Settings & Copyright
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Navbar — senior-level upgrade.
// • Active link highlighting via usePathname (exact + prefix matching)
// • Keyboard-accessible mobile menu (Escape to close)
// • ARIA attributes on all interactive controls
// • Router-based search (avoids full-page reload)
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  Search, Menu, X, User, LogOut, History, Heart,
  Settings, Calendar, ShieldCheck,
} from 'lucide-react'

interface NavLink {
  href: string
  label: string
  /** Match any pathname that starts with this prefix */
  matchPrefix?: string
}

const NAV_LINKS: NavLink[] = [
  { href: '/',                   label: 'Home',     matchPrefix: '/__exact__' },
  { href: '/anime?type=donghua', label: 'Donghua',  matchPrefix: '/anime'     },
  { href: '/anime?type=anime',   label: 'Anime',    matchPrefix: '/anime'     },
  { href: '/movies',             label: 'Movies',   matchPrefix: '/movies'    },
  { href: '/schedule',           label: 'Schedule', matchPrefix: '/schedule'  },
  { href: '/genres',             label: 'Genres',   matchPrefix: '/genres'    },
  { href: '/az-list',            label: 'A-Z List', matchPrefix: '/az-list'   },
]

function isLinkActive(link: NavLink, pathname: string): boolean {
  if (link.href === '/') return pathname === '/'
  if (link.matchPrefix) return pathname.startsWith(link.matchPrefix)
  return pathname === link.href || pathname.startsWith(link.href + '/')
}

export function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, logout, isAdmin } = useAuth()

  const [menuOpen,     setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [query,        setQuery]        = useState('')

  const userRef   = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Close mobile menu & user menu on Escape
  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setUserMenuOpen(false)
        if (searchOpen) { setSearchOpen(false); setQuery('') }
      }
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [searchOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setQuery('')
  }, [query, router])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setQuery('')
  }, [])

  return (
    <nav
      className="sticky top-0 z-50 bg-[#07080f]/95 backdrop-blur-2xl border-b border-white/6 shadow-[0_1px_30px_rgba(0,0,0,0.6)]"
      aria-label="Main navigation"
    >
      {/* Top cyan accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Brand ──────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="SC-ANIME KH home">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-cyan-400/40 shadow-[0_0_14px_rgba(0,212,255,0.3)] group-hover:ring-cyan-400/70 group-hover:shadow-[0_0_22px_rgba(0,212,255,0.5)] transition-all duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" aria-hidden className="w-full h-full object-cover" />
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

          {/* ── Desktop Nav ─────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center" role="list">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link, pathname)
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  role="listitem"
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                    active
                      ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20'
                      : 'text-neutral-300 hover:text-cyan-300 hover:bg-cyan-500/8',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* ── Right Actions ────────────────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 animate-scale-in" role="search">
                <label htmlFor="nav-search" className="sr-only">Search anime</label>
                <input
                  ref={searchRef}
                  id="nav-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anime..."
                  autoComplete="off"
                  className="bg-white/5 border border-white/12 rounded-xl px-3 py-1.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 w-44 transition-all"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={16} aria-hidden />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="p-2 rounded-xl text-neutral-400 hover:text-cyan-300 hover:bg-cyan-500/8 transition-all duration-200"
              >
                <Search size={19} aria-hidden />
              </button>
            )}

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all duration-200 group"
                >
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name}
                      width={32} height={32}
                      className="w-8 h-8 rounded-full ring-1 ring-cyan-400/40 group-hover:ring-cyan-400/70 transition-all object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm ring-1 ring-cyan-500/30">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    aria-label="User options"
                    className="absolute right-0 top-full mt-2 w-56 bg-[#0d0f1a]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-scale-in"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/6">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-[9px] text-cyan-300 font-bold mt-1">
                          <ShieldCheck size={9} aria-hidden /> Admin Access
                        </span>
                      )}
                    </div>

                    {/* Menu items */}
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
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        aria-current={pathname === href ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm transition-all',
                          pathname === href
                            ? 'text-cyan-300 bg-cyan-500/8'
                            : 'text-neutral-300 hover:text-white hover:bg-cyan-500/8',
                        )}
                      >
                        <Icon size={15} className="text-neutral-500 shrink-0" aria-hidden />
                        {label}
                      </Link>
                    ))}

                    {isAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/8 transition-all"
                      >
                        <ShieldCheck size={15} aria-hidden />
                        Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-white/6 mt-1">
                      <button
                        role="menuitem"
                        onClick={() => { setUserMenuOpen(false); logout() }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-all"
                      >
                        <LogOut size={15} aria-hidden />
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
                <User size={15} aria-hidden />
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────────────── */}
        {menuOpen && (
          <div
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            className="lg:hidden border-t border-white/6 py-3 space-y-0.5 animate-slide-up"
          >
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link, pathname)
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    active
                      ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/15'
                      : 'text-neutral-300 hover:text-cyan-300 hover:bg-cyan-500/8',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-cyan-400 hover:bg-cyan-500/8 rounded-xl transition-all"
              >
                <User size={15} aria-hidden />
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

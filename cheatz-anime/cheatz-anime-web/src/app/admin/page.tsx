'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Film, Crown, ShieldCheck, BarChart2,
  ArrowRight, ExternalLink, TrendingUp, Heart,
  QrCode, Copy, Check, Sparkles, Gift, Video,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { adminService, type ManagedUser } from '@/services/adminService'
import { Navbar } from '@/components/layout/Navbar'

// ── KHQR Donation Card ────────────────────────────────────────────────────────
function KhqrDonationCard() {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const ABAN_NAME = 'SOCHEAT VINCHAN'
  const ABAN_ID   = 'socheatvinchan@gmail.com'

  const handleCopy = () => {
    navigator.clipboard.writeText(ABAN_ID).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative bg-gradient-to-br from-[#0d0f1a] via-[#0a0c18] to-[#06080f] border border-red-500/25 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(220,38,38,0.08)]">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-400 to-red-600" />

      {/* Background glow blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <Heart size={16} className="text-red-400 fill-red-400" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-400">
                KHQR Donation
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              គាំទ្រ SC-ANIME KH 🇰🇭
            </h2>
            <p className="text-neutral-400 text-xs mt-1 font-sans">
              ស្ទ្រីម QR Code ខ្មែរ · ABA · ACLEDA · Wing
            </p>
          </div>

          {/* KHQR logo badge */}
          <div className="shrink-0 flex flex-col items-center justify-center bg-white rounded-2xl px-3 py-2 shadow-lg">
            <span className="text-red-600 font-black text-sm tracking-tight leading-none">KHQR</span>
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Cambodia</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative group">
              {/* Animated ring */}
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-red-500/30 via-rose-400/20 to-red-600/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white p-3 rounded-2xl shadow-2xl border-2 border-red-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/khqr.png"
                  alt="KHQR Donation QR Code — SC-ANIME KH"
                  className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                  draggable={false}
                />
              </div>
            </div>
            <span className="text-[11px] text-neutral-500 font-sans text-center">
              📱 Scan with any Khmer banking app
            </span>
          </div>

          {/* Info panel */}
          <div className="flex-1 w-full space-y-4">

            {/* Donor info */}
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <QrCode size={14} className="text-red-400" />
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Recipient</span>
              </div>

              <div>
                <p className="text-[11px] text-neutral-500 mb-0.5">Full Name</p>
                <p className="text-white font-extrabold text-sm tracking-wide">{ABAN_NAME}</p>
              </div>

              <div>
                <p className="text-[11px] text-neutral-500 mb-1">ABA / Account ID</p>
                <div className="flex items-center gap-2">
                  <code className="text-red-300 font-mono text-xs bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl flex-1 truncate">
                    {ABAN_ID}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-xl bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 text-red-400 transition-all shrink-0"
                    title="Copy"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Donation amounts */}
            <div>
              <p className="text-xs text-neutral-500 font-semibold mb-2 font-sans">💝 ចំនួនដែលពេញនិយម</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { usd: '$1', label: '☕ Coffee' },
                  { usd: '$5', label: '🍜 Noodle' },
                  { usd: '$10', label: '🎁 Gift' },
                ].map(amt => (
                  <div key={amt.usd}
                    className="bg-red-500/8 border border-red-500/20 hover:border-red-400/40 rounded-xl p-2.5 text-center cursor-default transition-all hover:bg-red-500/15 group">
                    <p className="text-white font-extrabold text-base group-hover:text-red-300 transition-colors">{amt.usd}</p>
                    <p className="text-neutral-500 text-[10px] font-sans">{amt.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported banks */}
            <div className="flex flex-wrap gap-2">
              {['ABA', 'ACLEDA', 'Wing', 'Pi Pay', 'TrueMoney', 'Chip Mong'].map(bank => (
                <span key={bank}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-400">
                  {bank}
                </span>
              ))}
            </div>

            {/* Thank you note */}
            <div className="bg-gradient-to-r from-red-950/40 to-rose-950/20 border border-red-500/15 rounded-xl p-3 flex items-start gap-2">
              <Sparkles size={13} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                អរគុណពីចិត្ត 🙏 ការ donate របស់អ្នកជួយឲ្យ SC-ANIME KH រក្សាការ stream ឥតគិតថ្លៃ
                សម្រាប់សហគមន៍ Anime ខ្មែរ។
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth()
  const router = useRouter()
  
  // Stats state
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [vipUsers, setVipUsers] = useState(0)
  const [adminStaff, setAdminStaff] = useState(0)
  
  // Recent users state
  const [recentUsers, setRecentUsers] = useState<ManagedUser[]>([])
  const [recentLoading, setRecentLoading] = useState(true)
  const [recentError, setRecentError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/')
  }, [user, isAdmin, loading, router])

  // Fetch stats from API
  const fetchStats = async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      // Make 3 parallel API calls to get counts via meta.total
      // Note: role=admin filter should return both admin + super_admin roles.
      // If API doesn't include super_admin, we'd need a second call with role=super_admin and sum the totals.
      const [totalResult, vipResult, adminResult] = await Promise.all([
        adminService.getUsers({ per_page: 1 }),
        adminService.getUsers({ per_page: 1, subscribed: true }),
        adminService.getUsers({ per_page: 1, role: 'admin' }),
      ])
      
      setTotalUsers(totalResult.meta.total)
      setVipUsers(vipResult.meta.total)
      setAdminStaff(adminResult.meta.total)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStatsError('Failed to load statistics. Please try again.')
    } finally {
      setStatsLoading(false)
    }
  }

  // Fetch recent 5 users
  const fetchRecentUsers = async () => {
    setRecentLoading(true)
    setRecentError(null)
    try {
      const result = await adminService.getUsers({ per_page: 5 })
      setRecentUsers(result.users)
    } catch (error) {
      console.error('Failed to fetch recent users:', error)
      setRecentError('Failed to load recent users. Please try again.')
    } finally {
      setRecentLoading(false)
    }
  }

  useEffect(() => {
    if (user && isAdmin) {
      fetchStats()
      fetchRecentUsers()
    }
  }, [user, isAdmin])

  if (loading || !user || !isAdmin) return null

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">

        {/* ── Welcome Hero ─────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-cyan-950/40 via-[#130a0b] to-[#0a0608] border border-cyan-500/25 rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden shadow-[0_0_50px_rgba(0,212,255,0.1)]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Crown size={13} />
                  {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'} ACTIVE
                </span>
                <span className="text-xs text-neutral-500 font-sans">ប្រព័ន្ធគ្រប់គ្រងមេ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans mb-2">
                ផ្ទាំងគ្រប់គ្រង Admin Dashboard
              </h1>
              <p className="text-neutral-400 text-sm font-sans max-w-2xl leading-relaxed">
                ស្វាគមន៍! អ្នកអាចដាក់ VIP ជូនអ្នកប្រើប្រាស់ កំណត់សិទ្ធិ Admin និងគ្រប់គ្រងមាតិការឿងទាំងអស់។
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-black/40 border border-cyan-500/15 px-3 py-1.5 rounded-xl text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Logged in as: <strong className="text-white">{user.email}</strong>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/admin/users"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(0,212,255,0.35)] hover:scale-105 transition-all font-sans">
                <Crown size={17} /> ដាក់ VIP & Admin
              </Link>
              <Link href="/"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#111420] border border-cyan-500/20 hover:border-cyan-400/40 text-neutral-300 hover:text-white font-bold text-sm transition-all">
                <ExternalLink size={16} /> View Site
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsError ? (
            <div className="col-span-2 md:col-span-4 bg-[#0d0f1a] border border-red-500/20 rounded-2xl p-6 text-center">
              <p className="text-red-400 text-sm mb-3">{statsError}</p>
              <button
                onClick={fetchStats}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors text-sm font-semibold"
              >
                Retry
              </button>
            </div>
          ) : statsLoading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#0d0f1a] border border-cyan-500/10 rounded-2xl p-5 animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-cyan-500/20 rounded" />
                    <div className="h-3 w-20 bg-neutral-700/50 rounded" />
                  </div>
                  <div className="h-8 w-16 bg-neutral-700/50 rounded mb-2" />
                  <div className="h-2 w-24 bg-neutral-700/50 rounded" />
                </div>
              ))}
            </>
          ) : (
            [
              { icon: Users,      label: 'Total Users',    value: totalUsers,    sub: 'Community accounts',     color: 'text-cyan-400',     bg: 'bg-cyan-500/10 border-cyan-500/20' },
              { icon: Crown,      label: 'VIP Members',    value: vipUsers,      sub: 'Active subscribers',     color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
              { icon: ShieldCheck,label: 'Admin Staff',    value: adminStaff,    sub: 'Admins & Super Admins',  color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
              { icon: Film,       label: 'Catalog Titles', value: '1,386+',      sub: 'Donghua · Anime · Films',color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            ].map(stat => (
              <div key={stat.label}
                className={`bg-[#0d0f1a] border ${stat.bg} rounded-2xl p-5 hover:-translate-y-0.5 transition-transform`}>
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon size={20} className={stat.color} />
                  <span className="text-xs text-neutral-500 font-sans font-semibold">{stat.label}</span>
                </div>
                <p className={`text-2xl sm:text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                {stat.sub && <p className="text-neutral-500 text-[11px] mt-1 font-sans">{stat.sub}</p>}
              </div>
            ))
          )}
        </div>

        {/* ── Quick Access Modules ──────────────────────────────────────── */}
        <h2 className="text-base font-bold text-white font-sans mb-4 flex items-center gap-2">
          <BarChart2 size={18} className="text-cyan-400" /> Admin Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            {
              href: '/admin/users', icon: Crown, color: 'text-amber-400',
              bg: 'bg-amber-500/10 border-amber-500/20', hover: 'hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]',
              title: 'Users & VIP Management',
              titleKm: 'គ្រប់គ្រង User & VIP',
              desc: 'ដាក់ VIP ជូនសមាជិក, កំណត់ Role Admin, ពិនិត្យបញ្ជីឈ្មោះ',
              cta: 'Manage Users',
            },
            {
              href: '/admin/anime', icon: Film, color: 'text-purple-400',
              bg: 'bg-purple-500/10 border-purple-500/20', hover: 'hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.12)]',
              title: 'Anime Catalog Control',
              titleKm: 'គ្រប់គ្រងរឿង Catalog',
              desc: 'ពិនិត្យរឿង 1,386+ · កំណត់ VIP-Only / Free access',
              cta: 'Manage Catalog',
            },
            {
              href: '/admin/videos/health', icon: Video, color: 'text-rose-400',
              bg: 'bg-rose-500/10 border-rose-500/20', hover: 'hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.12)]',
              title: 'Video Health Monitor',
              titleKm: 'ពិនិត្យវីដេអូ',
              desc: 'Scan all episodes, auto-fix broken videos, ensure 100% video availability',
              cta: 'Check Videos',
            },
            {
              href: '/', icon: ExternalLink, color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20', hover: 'hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
              title: 'Live Website Preview',
              titleKm: 'ទស្សនាគេហទំព័រ',
              desc: 'មើល UI ផ្ទៃខាងមុខ, PWA install prompt, video streams',
              cta: 'Open Site',
            },
          ].map(mod => (
            <Link key={mod.href} href={mod.href}
              className={`group bg-[#0d0f1a] border ${mod.bg} ${mod.hover} rounded-2xl p-5 transition-all flex flex-col justify-between`}>
              <div>
                <div className={`w-12 h-12 rounded-xl ${mod.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <mod.icon size={24} className={mod.color} />
                </div>
                <h3 className="font-bold text-white text-base">{mod.title}</h3>
                <p className="text-xs text-neutral-500 font-sans mt-1 leading-relaxed">{mod.desc}</p>
              </div>
              <div className={`flex items-center gap-1 ${mod.color} text-xs font-bold mt-4`}>
                {mod.cta} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Recent Users Preview ─────────────────────────────────────── */}
        <div className="bg-[#0d0f1a] border border-cyan-500/15 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white font-sans">Recent Users</h2>
              <p className="text-xs text-neutral-500 font-sans">1-click VIP toggle</p>
            </div>
            <Link href="/admin/users"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
              View All ({totalUsers}) <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentError ? (
              <div className="text-center py-8">
                <p className="text-red-400 text-sm mb-3">{recentError}</p>
                <button
                  onClick={fetchRecentUsers}
                  className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors text-sm font-semibold"
                >
                  Retry
                </button>
              </div>
            ) : recentLoading ? (
              <div className="text-center py-8 text-neutral-500">
                Loading users...
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                No users found
              </div>
            ) : (
              recentUsers.map((u) => {
                const isSuper = 
                  u.email.toLowerCase() === 'socheatvinchan@gmail.com' ||
                  u.email.toLowerCase() === 'socheatvireakchan@gmail.com'
                return (
                  <div key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#07080f] rounded-xl border border-cyan-500/10 gap-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                        alt={u.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-cyan-500/30" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs">{u.name}</span>
                          {isSuper && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-extrabold">SUPER ADMIN</span>}
                        </div>
                        <span className="text-xs text-neutral-500">{u.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {u.subscribed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                          <Crown size={11} /> VIP Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-[#111420] text-neutral-500 text-xs border border-cyan-500/10">Free</span>
                      )}
                      <Link href="/admin/users"
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                        Edit
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

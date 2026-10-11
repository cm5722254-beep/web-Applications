'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Film, Crown, ShieldCheck, BarChart2,
  ArrowRight, ExternalLink, TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { adminService, type ManagedUser } from '@/services/adminService'
import { Navbar } from '@/components/layout/Navbar'

export default function AdminDashboardPage() {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth()
  const router = useRouter()
  const [usersList, setUsersList] = useState<ManagedUser[]>([])

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/')
  }, [user, isAdmin, loading, router])

  useEffect(() => { setUsersList(adminService.getUsers()) }, [])

  if (loading || !user || !isAdmin) return null

  const totalUsers  = usersList.length
  const vipUsers    = usersList.filter(u => u.subscribed).length
  const adminStaff  = usersList.filter(u => u.roles.some(r => ['admin','super_admin'].includes(r))).length

  return (
    <div className="min-h-screen bg-[#0a0608] text-white flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">

        {/* ── Welcome Hero ─────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-red-950/40 via-[#130a0b] to-[#0a0608] border border-red-500/25 rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden shadow-[0_0_50px_rgba(225,29,72,0.1)]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Crown size={13} />
                  {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'} ACTIVE
                </span>
                <span className="text-xs text-rose-100/40 font-khmer">ប្រព័ន្ធគ្រប់គ្រងមេ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-khmer mb-2">
                ផ្ទាំងគ្រប់គ្រង Admin Dashboard
              </h1>
              <p className="text-rose-100/50 text-sm font-khmer max-w-2xl leading-relaxed">
                ស្វាគមន៍! អ្នកអាចដាក់ VIP ជូនអ្នកប្រើប្រាស់ កំណត់សិទ្ធិ Admin និងគ្រប់គ្រងមាតិការឿងទាំងអស់។
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-black/40 border border-red-500/15 px-3 py-1.5 rounded-xl text-xs text-rose-100/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Logged in as: <strong className="text-white">{user.email}</strong>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/admin/users"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(225,29,72,0.35)] hover:scale-105 transition-all font-khmer">
                <Crown size={17} /> ដាក់ VIP & Admin
              </Link>
              <Link href="/"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a0a0b] border border-red-500/20 hover:border-red-400/40 text-rose-100/70 hover:text-white font-bold text-sm transition-all">
                <ExternalLink size={16} /> View Site
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users,      label: 'Total Users',    value: totalUsers,    sub: 'Community accounts',     color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
            { icon: Crown,      label: 'VIP Members',    value: vipUsers,      sub: 'Active subscribers',     color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
            { icon: ShieldCheck,label: 'Admin Staff',    value: adminStaff,    sub: 'Admins & Super Admins',  color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
            { icon: Film,       label: 'Catalog Titles', value: '1,386+',      sub: 'Donghua · Anime · Films',color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          ].map(stat => (
            <div key={stat.label}
              className={`bg-[#130a0b] border ${stat.bg} rounded-2xl p-5 hover:-translate-y-0.5 transition-transform`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={20} className={stat.color} />
                <span className="text-xs text-rose-100/40 font-khmer font-semibold">{stat.label}</span>
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
              {stat.sub && <p className="text-rose-100/30 text-[11px] mt-1 font-khmer">{stat.sub}</p>}
            </div>
          ))}
        </div>

        {/* ── Quick Access Modules ──────────────────────────────────────── */}
        <h2 className="text-base font-bold text-white font-khmer mb-4 flex items-center gap-2">
          <BarChart2 size={18} className="text-red-400" /> Admin Modules
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
              href: '/', icon: ExternalLink, color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20', hover: 'hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
              title: 'Live Website Preview',
              titleKm: 'ទស្សនាគេហទំព័រ',
              desc: 'មើល UI ផ្ទៃខាងមុខ, PWA install prompt, video streams',
              cta: 'Open Site',
            },
          ].map(mod => (
            <Link key={mod.href} href={mod.href}
              className={`group bg-[#130a0b] border ${mod.bg} ${mod.hover} rounded-2xl p-5 transition-all flex flex-col justify-between`}>
              <div>
                <div className={`w-12 h-12 rounded-xl ${mod.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <mod.icon size={24} className={mod.color} />
                </div>
                <h3 className="font-bold text-white text-base">{mod.title}</h3>
                <p className="text-xs text-rose-100/40 font-khmer mt-1 leading-relaxed">{mod.desc}</p>
              </div>
              <div className={`flex items-center gap-1 ${mod.color} text-xs font-bold mt-4`}>
                {mod.cta} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Recent Users Preview ─────────────────────────────────────── */}
        <div className="bg-[#130a0b] border border-red-500/15 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white font-khmer">Recent Users</h2>
              <p className="text-xs text-rose-100/40 font-khmer">1-click VIP toggle</p>
            </div>
            <Link href="/admin/users"
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1">
              View All ({totalUsers}) <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {usersList.slice(0, 5).map((u) => {
              const isSuper = u.email.toLowerCase() === 'socheatvinchan@gmail.com'
              return (
                <div key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#0a0608] rounded-xl border border-red-500/10 gap-3">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                      alt={u.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-red-500/30" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{u.name}</span>
                        {isSuper && <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-extrabold">SUPER ADMIN</span>}
                      </div>
                      <span className="text-xs text-rose-100/40">{u.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {u.subscribed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                        <Crown size={11} /> VIP Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#1a0a0b] text-rose-100/40 text-xs border border-red-500/10">Free</span>
                    )}
                    <Link href="/admin/users"
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors">
                      Edit
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

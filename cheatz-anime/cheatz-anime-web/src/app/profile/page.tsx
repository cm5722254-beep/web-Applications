'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Crown,
  Heart,
  History,
  Settings,
  LogOut,
  Edit3,
  ShieldCheck,
  Sparkles,
  Star,
  Clock,
  Film,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { favoritesService, historyService, subscriptionService } from '@/services/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui'

export default function ProfilePage() {
  const { user, logout, loading, isAdmin, isSuperAdmin } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/profile')
  }, [user, loading, router])

  const { data: favData } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.list(),
    enabled: !!user,
  })

  const { data: histData } = useQuery({
    queryKey: ['watch-history'],
    queryFn: () => historyService.list(),
    enabled: !!user,
  })

  const { data: subStatus } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: subscriptionService.getStatus,
    enabled: !!user,
  })

  const { mutate: doLogout, isPending: loggingOut } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      router.push('/')
    },
  })

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0608] flex items-center justify-center">
        <LoadingSpinner size={44} />
      </div>
    )
  }

  const favCount = favData?.data?.length ?? 0
  const histCount = histData?.data?.length ?? 0
  const isVip = user.subscribed || subStatus?.subscribed

  const stats = [
    { icon: Heart, label: 'Favorites', value: favCount, color: 'text-pink-400', href: '/favorites' },
    { icon: History, label: 'Watched', value: histCount, color: 'text-red-400', href: '/history' },
    { icon: Film, label: 'Episodes', value: histCount * 1, color: 'text-red-400', href: '/history' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0608] text-white flex flex-col">
      <Navbar />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 relative z-10">

        {/* Profile Hero Card */}
        <div className="relative bg-gradient-to-br from-[#0c0e18] via-[#0e111f] to-[#0c0e18] border border-red-500/18 rounded-3xl p-8 mb-6 overflow-hidden shadow-2xl">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/60 to-transparent" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-red-400/50 shadow-[0_0_20px_rgba(225,29,72,0.3)]"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-4xl font-black text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] border-2 border-red-400/50">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {isVip && (
                <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-xl p-1.5 shadow-lg border border-amber-400/30">
                  <Crown size={14} className="text-black" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
                {isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold px-2.5 py-0.5 rounded-lg">
                    <Crown size={11} /> SUPER ADMIN
                  </span>
                )}
                {isAdmin && !isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-2.5 py-0.5 rounded-lg">
                    <ShieldCheck size={11} /> ADMIN
                  </span>
                )}
              </div>
              <p className="text-neutral-400 text-sm mb-3">{user.email}</p>

              {/* VIP Status */}
              {isVip ? (
                <span className="inline-flex items-center gap-1.5 text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold px-3 py-1 rounded-xl">
                  <Crown size={12} /> VIP Member — Unlimited Access
                </span>
              ) : (
                <Link
                  href="/subscription"
                  className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-red-600 to-rose-700 text-black font-extrabold px-3 py-1.5 rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(225,29,72,0.4)]"
                >
                  <Sparkles size={12} /> Upgrade to VIP — $1 Forever
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-row sm:flex-col gap-2">
              <Link
                href="/settings"
                className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 px-3 py-2 rounded-xl transition-all"
              >
                <Settings size={14} /> Settings
              </Link>
              <button
                onClick={() => doLogout()}
                disabled={loggingOut}
                className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl transition-all"
              >
                {loggingOut ? <LoadingSpinner size={14} /> : <LogOut size={14} />}
                Sign Out
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-black/30 hover:bg-white/5 border border-white/5 hover:border-red-500/25 transition-all group"
              >
                <stat.icon size={20} className={`${stat.color} group-hover:scale-110 transition-transform`} />
                <span className="text-xl font-black text-white">{stat.value}</span>
                <span className="text-[11px] text-neutral-400 font-semibold">{stat.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link
            href="/favorites"
            className="group flex items-center gap-4 p-5 bg-[#130a0b] border border-white/5 hover:border-pink-500/30 rounded-2xl transition-all hover:bg-pink-500/5"
          >
            <div className="w-11 h-11 rounded-xl bg-pink-500/20 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform">
              <Heart size={20} className="text-pink-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">My Favorites</p>
              <p className="text-neutral-400 text-xs">{favCount} saved series</p>
            </div>
          </Link>

          <Link
            href="/history"
            className="group flex items-center gap-4 p-5 bg-[#130a0b] border border-white/5 hover:border-red-500/25 rounded-2xl transition-all hover:bg-red-600/5"
          >
            <div className="w-11 h-11 rounded-xl bg-red-500/18 flex items-center justify-center border border-red-500/18 group-hover:scale-110 transition-transform">
              <History size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Watch History</p>
              <p className="text-neutral-400 text-xs">{histCount} episodes watched</p>
            </div>
          </Link>

          <Link
            href="/subscription"
            className="group flex items-center gap-4 p-5 bg-[#130a0b] border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all hover:bg-amber-500/5"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Crown size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">VIP Membership</p>
              <p className="text-neutral-400 text-xs">{isVip ? 'Active — Unlimited access' : 'Upgrade for $1 lifetime'}</p>
            </div>
          </Link>

          <Link
            href="/settings"
            className="group flex items-center gap-4 p-5 bg-[#130a0b] border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all hover:bg-blue-500/5"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Settings size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Settings</p>
              <p className="text-neutral-400 text-xs">Preferences & notifications</p>
            </div>
          </Link>
        </div>

        {/* Admin Panel Link */}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-950/30 via-[#0e111f] to-amber-950/30 border border-amber-500/30 rounded-2xl hover:border-amber-400/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Crown size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-amber-300 font-bold text-sm">Admin Panel</p>
                <p className="text-neutral-400 text-xs">Manage content, users & subscriptions</p>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-bold">Open →</span>
          </Link>
        )}
      </main>

      <Footer />
    </div>
  )
}

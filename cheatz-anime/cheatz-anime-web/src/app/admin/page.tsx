'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Film,
  Crown,
  FileText,
  Settings,
  BarChart2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  UserCheck,
  CheckCircle,
  ExternalLink
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

  useEffect(() => {
    setUsersList(adminService.getUsers())
  }, [])

  if (loading || !user || !isAdmin) return null

  const totalUsers = usersList.length
  const vipUsers = usersList.filter(u => u.subscribed).length
  const adminStaff = usersList.filter(u => u.roles.some(r => ['admin', 'super_admin'].includes(r))).length

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-brand-purple/20 via-brand-surface to-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Crown size={14} /> SUPER ADMIN ACTIVE
                </span>
                <span className="text-xs text-brand-muted font-khmer">ប្រព័ន្ធគ្រប់គ្រងមេ</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-khmer">
                ផ្ទាំងគ្រប់គ្រង Super Admin Dashboard
              </h1>
              <p className="text-brand-muted text-sm font-khmer mt-2 max-w-2xl">
                សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងគេហទំព័រ SC-ANIME។ អ្នកអាចដាក់ VIP ជូនអ្នកប្រើប្រាស់ កំណត់សិទ្ធិ Admin និងគ្រប់គ្រងមាតិការឿងទាំងអស់បានដោយសេរី។
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-brand-bg/80 border border-brand-border px-3 py-1.5 rounded-xl text-xs text-brand-muted">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Super Admin: <strong className="text-white">socheatvinchan@gmail.com</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/users"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 transition-all font-khmer"
              >
                <Crown size={18} />
                <span>ដាក់ VIP & កំណត់ ADMIN</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users size={22} className="text-red-400" />}
            label="អ្នកប្រើប្រាស់សរុប (Users)"
            value={totalUsers}
            sub="Active community accounts"
          />
          <StatCard
            icon={<Crown size={22} className="text-amber-400" />}
            label="សមាជិក VIP (Subscribers)"
            value={vipUsers}
            color="amber"
            sub="ទទួលបានសិទ្ធិ VIP ពេញលេញ"
          />
          <StatCard
            icon={<ShieldCheck size={22} className="text-purple-400" />}
            label="អ្នកគ្រប់គ្រង (Admin Staff)"
            value={adminStaff}
            color="purple"
            sub="Super Admin & Admin"
          />
          <StatCard
            icon={<Film size={22} className="text-emerald-400" />}
            label="រឿងក្នុងប្រព័ន្ធ (Catalog Titles)"
            value="1,386+"
            color="green"
            sub="ដុងហ្វ័រ · អ្នីម៉េ · ភាពយន្ត"
          />
        </div>

        {/* Quick Access Modules */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white font-khmer mb-4 flex items-center gap-2">
            <span>មុខងារគ្រប់គ្រងសំខាន់ៗ</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/users"
              className="group bg-brand-surface border border-brand-border hover:border-amber-500/50 rounded-2xl p-5 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Crown size={24} />
                </div>
                <h3 className="font-bold text-white text-base font-khmer">គ្រប់គ្រងអ្នកប្រើប្រាស់ & VIP</h3>
                <p className="text-xs text-brand-muted font-khmer mt-1 leading-relaxed">
                  ដាក់ VIP ជូនសមាជិក, កំណត់ Role Admin, ពិនិត្យបញ្ជីឈ្មោះ និងគ្រប់គ្រងគណនីទាំងអស់។
                </p>
              </div>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mt-4">
                <span>ចូលទៅគ្រប់គ្រង User</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/admin/anime"
              className="group bg-brand-surface border border-brand-border hover:border-brand-violet rounded-2xl p-5 transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-violet/20 text-brand-glow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Film size={24} />
                </div>
                <h3 className="font-bold text-white text-base font-khmer">គ្រប់គ្រងរឿង (Anime & Donghua)</h3>
                <p className="text-xs text-brand-muted font-khmer mt-1 leading-relaxed">
                  ពិនិត្យរឿងទាំង 1,386+, កំណត់រឿងណាសម្រាប់ VIP តែមួយគត់ ឬសម្រាប់ទស្សនាឥតគិតថ្លៃ។
                </p>
              </div>
              <div className="flex items-center gap-1 text-brand-glow text-xs font-bold mt-4">
                <span>ចូលទៅគ្រប់គ្រងរឿង</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/"
              className="group bg-brand-surface border border-brand-border hover:border-emerald-500/50 rounded-2xl p-5 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ExternalLink size={24} />
                </div>
                <h3 className="font-bold text-white text-base font-khmer">ទស្សនាគេហទំព័រ (Home Front)</h3>
                <p className="text-xs text-brand-muted font-khmer mt-1 leading-relaxed">
                  មើលរូបរាងគេហទំព័រផ្ទាល់ពីខាងមុខ (Client Live View) ជាមួយនឹង UI ថ្មី និង PWA។
                </p>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-4">
                <span>បើកមើលគេហទំព័រដើម</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Registered Users Preview with 1-click VIP Toggle */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white font-khmer">អ្នកប្រើប្រាស់ថ្មីៗ (Recent Users)</h2>
              <p className="text-xs text-brand-muted font-khmer">ចុចប៊ូតុង "ដាក់ VIP" ដើម្បីផ្តល់សិទ្ធិ VIP ភ្លាមៗ</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold font-khmer flex items-center gap-1"
            >
              <span>មើលទាំងអស់ ({totalUsers})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {usersList.slice(0, 5).map((u) => {
              const isSuper = u.email.toLowerCase() === 'socheatvinchan@gmail.com'
              return (
                <div
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-brand-bg rounded-xl border border-brand-border gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-brand-border"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">{u.name}</span>
                        {isSuper && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-extrabold">
                            SUPER ADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-brand-muted">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {u.subscribed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                        <Crown size={12} /> VIP Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-brand-surface text-brand-muted text-xs border border-brand-border">
                        Free User
                      </span>
                    )}

                    <Link
                      href="/admin/users"
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors font-khmer"
                    >
                      កែសម្រួល
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

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color?: 'amber' | 'purple' | 'green'
}) {
  const colorMap: Record<string, string> = {
    amber: 'text-amber-400',
    purple: 'text-brand-glow',
    green: 'text-emerald-400',
  }
  const colorClass = (color && colorMap[color]) || 'text-white'

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center gap-2 text-brand-muted mb-2">
        {icon}
        <span className="text-xs font-khmer font-semibold">{label}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-extrabold ${colorClass}`}>{value}</p>
      {sub && <p className="text-brand-muted text-[11px] mt-1 font-khmer">{sub}</p>}
    </div>
  )
}

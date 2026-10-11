'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Crown, ShieldCheck, Search, UserPlus, ArrowLeft,
  Check, X, RefreshCw, Trash2, AlertCircle, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { adminService, type ManagedUser } from '@/services/adminService'
import { Navbar } from '@/components/layout/Navbar'

export default function AdminUsersPage() {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth()
  const router = useRouter()

  const [usersList, setUsersList] = useState<ManagedUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab]   = useState<'all'|'vip'|'admin'|'free'>('all')
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  const [vipModalOpen, setVipModalOpen] = useState(false)
  const [vipDuration, setVipDuration]   = useState('1 Month VIP')
  const [newUserModal, setNewUserModal] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error'|'info' } | null>(null)

  // New user form
  const [nName,  setNName]  = useState('')
  const [nEmail, setNEmail] = useState('')
  const [nRole,  setNRole]  = useState<'user'|'admin'|'super_admin'>('user')
  const [nVip,   setNVip]   = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/')
  }, [user, isAdmin, loading, router])

  const loadUsers = () => setUsersList(adminService.getUsers())
  useEffect(() => { loadUsers() }, [])

  const showToast = (msg: string, type: 'success'|'error'|'info' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const filtered = useMemo(() => {
    return usersList.filter(u => {
      const q = searchQuery.toLowerCase()
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
      if (filterTab === 'vip')   return u.subscribed
      if (filterTab === 'admin') return u.roles.some(r => ['admin','super_admin'].includes(r))
      if (filterTab === 'free')  return !u.subscribed
      return true
    })
  }, [usersList, searchQuery, filterTab])

  const totalCount = usersList.length
  const vipCount   = usersList.filter(u => u.subscribed).length
  const adminCount = usersList.filter(u => u.roles.some(r => ['admin','super_admin'].includes(r))).length

  const handleToggleVip = (u: ManagedUser) => {
    const next = !u.subscribed
    const res = adminService.setVip(u.id, next, next ? '1 Month VIP' : undefined)
    if (res) { loadUsers(); showToast(next ? `VIP activated for ${u.name}!` : `VIP removed from ${u.name}`) }
  }

  const handleApplyVip = () => {
    if (!selectedUser) return
    const res = adminService.setVip(selectedUser.id, true, vipDuration)
    if (res) { loadUsers(); setVipModalOpen(false); showToast(`${vipDuration} set for ${selectedUser.name}!`) }
  }

  const handleRole = (userId: number, role: 'user'|'admin'|'super_admin', name: string) => {
    const res = adminService.setRole(userId, role)
    if (res) { loadUsers(); showToast(`Role updated to ${role} for ${name}`) }
  }

  const handleDelete = (u: ManagedUser) => {
    if (u.email.toLowerCase() === 'socheatvinchan@gmail.com') { showToast('Cannot delete Super Admin!', 'error'); return }
    if (confirm(`Delete ${u.name}?`)) {
      adminService.deleteUser(u.id)
      loadUsers()
      showToast(`Deleted ${u.name}`, 'info')
    }
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nEmail || !nName) return
    const all = adminService.getUsers()
    all.push({
      id: Date.now(), name: nName, email: nEmail,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120`,
      roles: nRole === 'super_admin' ? ['user','admin','super_admin'] : nRole === 'admin' ? ['user','admin'] : ['user'],
      subscribed: nVip, subscription_plan: nVip ? '1 Month VIP' : null,
      subscription_expires_at: nVip ? new Date(Date.now() + 30*86400000).toISOString() : null,
      status: 'active', created_at: new Date().toISOString(),
    })
    adminService.saveUsers(all)
    loadUsers()
    setNewUserModal(false)
    setNName(''); setNEmail(''); setNRole('user'); setNVip(false)
    showToast(`User ${nName} created!`)
  }

  if (loading || !user || !isAdmin) return null

  // Color helpers
  const C = 'text-rose-100/50'
  const rowBase = 'hover:bg-red-500/5 transition-colors'

  return (
    <div className="min-h-screen bg-[#0a0608] text-white flex flex-col">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold animate-slide-up ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300' :
          toast.type === 'error'   ? 'bg-red-950/90 border-red-500/50 text-red-300' :
                                     'bg-blue-950/90 border-blue-500/50 text-blue-300'
        }`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 bg-[#130a0b] border border-red-500/15 hover:border-red-400/40 rounded-xl text-rose-100/50 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-khmer">Users & VIP Management</h1>
              <p className="text-rose-100/40 text-xs sm:text-sm font-khmer mt-0.5">ដាក់ VIP · Admin Role · គ្រប់គ្រងគណនី</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setNewUserModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl text-sm transition-all shadow-[0_0_18px_rgba(225,29,72,0.35)] hover:scale-105">
              <UserPlus size={16} /> Add User
            </button>
            <button onClick={loadUsers} title="Refresh"
              className="p-2.5 bg-[#130a0b] border border-red-500/15 hover:border-red-400/30 rounded-xl text-rose-100/50 hover:text-white transition-colors">
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users,      label: 'Total Users', val: totalCount, color: 'text-red-400',    bg: 'border-red-500/15' },
            { icon: Crown,      label: 'VIP Members', val: vipCount,   color: 'text-amber-400',  bg: 'border-amber-500/25' },
            { icon: ShieldCheck,label: 'Admins',      val: adminCount, color: 'text-purple-400', bg: 'border-purple-500/20' },
            { icon: Sparkles,   label: 'Free Users',  val: totalCount - vipCount, color: 'text-emerald-400', bg: 'border-emerald-500/15' },
          ].map(s => (
            <div key={s.label} className={`bg-[#130a0b] border ${s.bg} rounded-2xl p-4 sm:p-5`}>
              <div className={`flex items-center gap-2 ${s.color} text-xs mb-2 font-semibold`}>
                <s.icon size={15} /> {s.label}
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="bg-[#130a0b] border border-red-500/15 rounded-2xl p-4 mb-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
            {([['all','All',totalCount],['vip','👑 VIP',vipCount],['admin','🛡️ Admin',adminCount],['free','👤 Free',totalCount-vipCount]] as const).map(([id,label,cnt]) => (
              <button key={id} onClick={() => setFilterTab(id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterTab === id ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.35)]' : 'text-rose-100/40 hover:text-rose-100/70 hover:bg-red-500/8'
                }`}>
                {label} <span className="opacity-60">({cnt})</span>
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-100/30" />
            <input type="text" placeholder="Search name or email..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0608] border border-red-500/15 focus:border-red-500/40 rounded-xl pl-10 pr-9 py-2 text-sm text-white placeholder-rose-100/25 outline-none transition-colors" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-100/30 hover:text-rose-100/60">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#130a0b] border border-red-500/15 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0a0608]/70 border-b border-red-500/10 text-rose-100/35 uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-5">User</th>
                  <th className="py-3.5 px-4">VIP Status</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-500/8">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-rose-100/30 font-khmer">No users found</td></tr>
                ) : filtered.map(u => {
                  const isRoot = u.email.toLowerCase() === 'socheatvinchan@gmail.com'
                  const role   = u.roles.includes('super_admin') ? 'super_admin' : u.roles.includes('admin') ? 'admin' : 'user'
                  return (
                    <tr key={u.id} className={rowBase}>
                      <td className="py-4 px-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500/20" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-700 to-rose-700 flex items-center justify-center font-black text-white">
                              {u.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-sm">{u.name}</span>
                              {isRoot && <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-extrabold">OWNER</span>}
                            </div>
                            <span className="text-xs text-rose-100/35">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleVip(u)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              u.subscribed
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 hover:bg-amber-500/30'
                                : 'bg-[#0a0608] text-rose-100/40 border border-red-500/10 hover:border-amber-500/30 hover:text-amber-400'
                            }`}>
                            <Crown size={12} className={u.subscribed ? 'text-amber-400' : ''} />
                            {u.subscribed ? 'VIP ✓' : 'Give VIP'}
                          </button>
                          {!isRoot && (
                            <button onClick={() => { setSelectedUser(u); setVipDuration(u.subscription_plan||'1 Month VIP'); setVipModalOpen(true) }}
                              className="text-[10px] text-rose-100/30 hover:text-amber-400 transition-colors px-1.5 py-1 rounded-lg hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20">
                              Custom
                            </button>
                          )}
                        </div>
                        {u.subscribed && u.subscription_plan && (
                          <p className="text-[10px] text-amber-400/60 mt-1">{u.subscription_plan}</p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {isRoot ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-extrabold">
                            <Crown size={11} /> Super Admin
                          </span>
                        ) : (
                          <select value={role}
                            onChange={e => handleRole(u.id, e.target.value as any, u.name)}
                            className="bg-[#0a0608] border border-red-500/15 hover:border-red-400/30 text-xs rounded-xl px-3 py-2 text-rose-100/70 outline-none focus:border-red-500/40 transition-colors cursor-pointer">
                            <option value="user">👤 User</option>
                            <option value="admin">🛡️ Admin</option>
                            <option value="super_admin">👑 Super Admin</option>
                          </select>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          u.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                            : 'bg-red-500/15 text-red-400 border-red-500/25'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {u.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => adminService.toggleStatus(u.id) && loadUsers()}
                            className="p-1.5 rounded-lg bg-[#0a0608] border border-red-500/10 text-rose-100/35 hover:text-amber-400 hover:border-amber-500/30 transition-colors text-[10px] px-2 font-semibold">
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          {!isRoot && (
                            <button onClick={() => handleDelete(u)}
                              className="p-1.5 rounded-lg bg-[#0a0608] border border-red-500/10 text-rose-100/30 hover:text-red-400 hover:border-red-500/30 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-[#0a0608]/50 border-t border-red-500/8 text-xs text-rose-100/25 text-center font-khmer">
            Showing {filtered.length} of {totalCount} users
          </div>
        </div>
      </main>

      {/* ── VIP Duration Modal ─────────────────────────────────────────── */}
      {vipModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#130a0b] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent rounded-t-3xl" />
            <h2 className="text-lg font-extrabold text-white mb-1 flex items-center gap-2"><Crown size={18} className="text-amber-400" /> Set VIP Plan</h2>
            <p className="text-sm text-rose-100/50 mb-5">For: <strong className="text-white">{selectedUser.name}</strong></p>
            <div className="space-y-2.5 mb-6">
              {['1 Month VIP','3 Months VIP','6 Months VIP','1 Year VIP','Lifetime VIP'].map(plan => (
                <button key={plan} onClick={() => setVipDuration(plan)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    vipDuration === plan
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-[#0a0608] border-red-500/10 text-rose-100/50 hover:border-amber-500/25 hover:text-amber-400/70'
                  }`}>
                  <Crown size={13} className="inline mr-2 opacity-70" />{plan}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={handleApplyVip}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold py-3 rounded-xl transition-all">
                Apply VIP Plan
              </button>
              <button onClick={() => setVipModalOpen(false)}
                className="px-4 py-3 bg-[#0a0608] border border-red-500/15 rounded-xl text-rose-100/50 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add User Modal ────────────────────────────────────────────── */}
      {newUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#130a0b] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent rounded-t-3xl" />
            <h2 className="text-lg font-extrabold text-white mb-5 flex items-center gap-2"><UserPlus size={18} className="text-red-400" /> Add New User</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-rose-100/40 font-semibold mb-1.5 block">Full Name</label>
                <input value={nName} onChange={e => setNName(e.target.value)} required
                  className="w-full bg-[#0a0608] border border-red-500/15 focus:border-red-500/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-rose-100/25 outline-none"
                  placeholder="User full name" />
              </div>
              <div>
                <label className="text-xs text-rose-100/40 font-semibold mb-1.5 block">Email</label>
                <input type="email" value={nEmail} onChange={e => setNEmail(e.target.value)} required
                  className="w-full bg-[#0a0608] border border-red-500/15 focus:border-red-500/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-rose-100/25 outline-none"
                  placeholder="user@email.com" />
              </div>
              <div>
                <label className="text-xs text-rose-100/40 font-semibold mb-1.5 block">Role</label>
                <select value={nRole} onChange={e => setNRole(e.target.value as any)}
                  className="w-full bg-[#0a0608] border border-red-500/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                  <option value="user">👤 Regular User</option>
                  <option value="admin">🛡️ Admin</option>
                  <option value="super_admin">👑 Super Admin</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setNVip(!nVip)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${nVip ? 'bg-amber-500' : 'bg-white/10'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${nVip ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-rose-100/60 font-semibold">Grant VIP access</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold py-3 rounded-xl transition-all">
                  Create User
                </button>
                <button type="button" onClick={() => setNewUserModal(false)}
                  className="px-4 py-3 bg-[#0a0608] border border-red-500/15 rounded-xl text-rose-100/50 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

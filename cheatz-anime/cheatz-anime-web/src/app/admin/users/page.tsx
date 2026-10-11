'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Crown,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  UserPlus,
  ArrowLeft,
  Check,
  X,
  MoreVertical,
  Calendar,
  Sparkles,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { adminService, type ManagedUser } from '@/services/adminService'
import { Navbar } from '@/components/layout/Navbar'

export default function AdminUsersPage() {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth()
  const router = useRouter()

  const [usersList, setUsersList] = useState<ManagedUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'vip' | 'admin' | 'free'>('all')
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  const [vipModalOpen, setVipModalOpen] = useState(false)
  const [vipDuration, setVipDuration] = useState('1 Month VIP')
  const [newUserModalOpen, setNewUserModalOpen] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)

  // Form for new user
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin' | 'super_admin'>('user')
  const [newUserIsVip, setNewUserIsVip] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/')
    }
  }, [user, isAdmin, loading, router])

  const loadUsers = () => {
    const list = adminService.getUsers()
    setUsersList(list)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Filtered users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (filterTab === 'vip') return u.subscribed
      if (filterTab === 'admin') return u.roles.some((r) => ['admin', 'super_admin'].includes(r))
      if (filterTab === 'free') return !u.subscribed
      return true
    })
  }, [usersList, searchQuery, filterTab])

  // Stats
  const totalCount = usersList.length
  const vipCount = usersList.filter((u) => u.subscribed).length
  const adminCount = usersList.filter((u) => u.roles.some((r) => ['admin', 'super_admin'].includes(r))).length

  // Quick VIP toggle
  const handleToggleVip = (u: ManagedUser) => {
    const nextState = !u.subscribed
    const updated = adminService.setVip(u.id, nextState, nextState ? '1 Month VIP' : undefined)
    if (updated) {
      loadUsers()
      showToast(
        nextState
          ? `បានដាក់ VIP ជូន ${u.name} ជោគជ័យ!`
          : `បានដក VIP ពី ${u.name} រួចរាល់!`
      )
    }
  }

  // Open VIP modal for custom duration
  const openVipModal = (u: ManagedUser) => {
    setSelectedUser(u)
    setVipDuration(u.subscription_plan || '1 Month VIP')
    setVipModalOpen(true)
  }

  const handleApplyVipPlan = () => {
    if (!selectedUser) return
    const updated = adminService.setVip(selectedUser.id, true, vipDuration)
    if (updated) {
      loadUsers()
      setVipModalOpen(false)
      showToast(`បានកំណត់ ${vipDuration} ជូន ${selectedUser.name} ជោគជ័យ!`)
    }
  }

  // Set Role
  const handleRoleChange = (userId: number, newRole: 'user' | 'admin' | 'super_admin', userName: string) => {
    const updated = adminService.setRole(userId, newRole)
    if (updated) {
      loadUsers()
      const roleText =
        newRole === 'super_admin' ? 'Super Admin' : newRole === 'admin' ? 'Admin' : 'User'
      showToast(`បានប្តូរតួនាទី ${userName} ទៅជា ${roleText} ជោគជ័យ!`)
    }
  }

  // Toggle status
  const handleToggleStatus = (u: ManagedUser) => {
    const updated = adminService.toggleStatus(u.id)
    if (updated) {
      loadUsers()
      showToast(`បានប្តូរស្ថានភាព ${u.name} ទៅជា ${updated.status}!`, 'info')
    }
  }

  // Delete user
  const handleDeleteUser = (u: ManagedUser) => {
    if (u.email.toLowerCase() === 'socheatvinchan@gmail.com') {
      showToast('មិនអាចលុបគណនី Super Admin បានទេ!', 'error')
      return
    }
    if (confirm(`តើអ្នកប្រាកដថាចង់លុបគណនី ${u.name} មែនទេ?`)) {
      adminService.deleteUser(u.id)
      loadUsers()
      showToast(`បានលុបអ្នកប្រើប្រាស់ ${u.name} រួចរាល់!`, 'info')
    }
  }

  // Create new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserEmail || !newUserName) return

    const all = adminService.getUsers()
    const newUser: ManagedUser = {
      id: Date.now(),
      name: newUserName,
      email: newUserEmail,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
      roles: newUserRole === 'super_admin' ? ['user', 'admin', 'super_admin'] : newUserRole === 'admin' ? ['user', 'admin'] : ['user'],
      subscribed: newUserIsVip,
      subscription_plan: newUserIsVip ? '1 Month VIP' : null,
      subscription_expires_at: newUserIsVip ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
      status: 'active',
      created_at: new Date().toISOString(),
    }

    all.push(newUser)
    adminService.saveUsers(all)
    loadUsers()
    setNewUserModalOpen(false)
    setNewUserName('')
    setNewUserEmail('')
    setNewUserRole('user')
    setNewUserIsVip(false)
    showToast(`បានបង្កើតគណនី ${newUserName} ជោគជ័យ!`)
  }

  if (loading || !user || !isAdmin) return null

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      <Navbar />

      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all duration-300 animate-slide-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
              : notification.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-300'
              : 'bg-blue-950/90 border-blue-500/50 text-blue-300'
          }`}
        >
          {notification.type === 'success' ? (
            <Check size={18} className="text-emerald-400" />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 bg-brand-surface border border-brand-border hover:border-brand-violet rounded-xl text-brand-muted hover:text-brand-text transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-khmer">
                  គ្រប់គ្រងអ្នកប្រើប្រាស់ & VIP
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-brand-muted text-xs sm:text-sm font-khmer mt-1">
                ដាក់ VIP ជូនសមាជិក · កំណត់សិទ្ធិ Admin/Super Admin · គ្រប់គ្រងគណនី
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNewUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 font-khmer"
            >
              <UserPlus size={18} />
              <span>បន្ថែមសមាជិកថ្មី</span>
            </button>
            <button
              onClick={loadUsers}
              className="p-2.5 bg-brand-surface border border-brand-border hover:border-brand-violet rounded-xl text-brand-muted hover:text-brand-text transition-colors"
              title="Refresh List"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-brand-muted text-xs font-khmer mb-2">
              <Users size={16} className="text-red-400" />
              <span>អ្នកប្រើប្រាស់សរុប</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{totalCount}</p>
            <p className="text-[11px] text-brand-muted mt-1 font-khmer">គណនីចុះឈ្មោះ</p>
          </div>

          <div className="bg-brand-surface border border-amber-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute -right-3 -top-3 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 text-amber-400 text-xs font-khmer mb-2">
              <Crown size={16} />
              <span>សមាជិក VIP</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{vipCount}</p>
            <p className="text-[11px] text-amber-400/70 mt-1 font-khmer">ទស្សនាគ្មានដែនកំណត់</p>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-brand-violet text-xs font-khmer mb-2">
              <ShieldCheck size={16} />
              <span>ក្រុមការងារ Admin</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-brand-glow">{adminCount}</p>
            <p className="text-[11px] text-brand-muted mt-1 font-khmer">មានសិទ្ធិគ្រប់គ្រង</p>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-khmer mb-2">
              <Sparkles size={16} />
              <span>Super Admin Email</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white truncate">socheatvinchan@gmail.com</p>
            <p className="text-[11px] text-emerald-400 mt-1 font-khmer">Active & Master Privileges</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'ទាំងអស់ (All)', count: totalCount },
              { id: 'vip', label: '👑 សមាជិក VIP', count: vipCount },
              { id: 'admin', label: '🛡️ Admin Staff', count: adminCount },
              { id: 'free', label: '👤 Regular User', count: totalCount - vipCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterTab === tab.id
                    ? 'bg-brand-violet text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-border/40'
                }`}
              >
                {tab.label} <span className="opacity-70 text-[11px]">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ ឬ Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border focus:border-brand-violet rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-brand-text placeholder-brand-muted outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Users Table / List */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-brand-bg/60 border-b border-brand-border text-brand-muted font-khmer uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">ឈ្មោះ និង Email</th>
                  <th className="py-3.5 px-4">VIP STATUS (ដាក់ VIP)</th>
                  <th className="py-3.5 px-4">តួនាទី (SET ADMIN)</th>
                  <th className="py-3.5 px-4">ស្ថានភាព</th>
                  <th className="py-3.5 px-4 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-brand-muted font-khmer">
                      មិនមានអ្នកប្រើប្រាស់ត្រូវនឹងការស្វែងរកទេ
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isRootSuper = u.email.toLowerCase() === 'socheatvinchan@gmail.com'
                    const isUserAdmin = u.roles.includes('super_admin') || u.roles.includes('admin')
                    const userRole = u.roles.includes('super_admin')
                      ? 'super_admin'
                      : u.roles.includes('admin')
                      ? 'admin'
                      : 'user'

                    return (
                      <tr key={u.id} className="hover:bg-brand-border/20 transition-colors">
                        {/* Name & Email */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-violet flex items-center justify-center font-bold text-white text-sm">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{u.name}</span>
                                {isRootSuper && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    OWNER
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-brand-muted block">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* VIP Status & Quick Toggle */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {u.subscribed ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                <Crown size={13} className="text-amber-400" />
                                <span>{u.subscription_plan || 'VIP Active'}</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-bg text-brand-muted border border-brand-border text-xs">
                                Regular (Free)
                              </span>
                            )}

                            {/* Button to toggle or configure VIP */}
                            <button
                              onClick={() => openVipModal(u)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-bg hover:bg-brand-surface border border-brand-border hover:border-amber-400 text-amber-400 transition-colors"
                              title="ផ្លាស់ប្តូរ VIP Plan"
                            >
                              ដាក់ VIP
                            </button>
                          </div>
                        </td>

                        {/* Role selection (Set to Admin) */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={userRole}
                              disabled={isRootSuper}
                              onChange={(e) =>
                                handleRoleChange(u.id, e.target.value as any, u.name)
                              }
                              className={`bg-brand-bg border rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none transition-colors ${
                                userRole === 'super_admin'
                                  ? 'border-amber-500/40 text-amber-400'
                                  : userRole === 'admin'
                                  ? 'border-brand-violet text-brand-glow'
                                  : 'border-brand-border text-brand-muted'
                              } ${isRootSuper ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer hover:border-brand-violet'}`}
                            >
                              <option value="user">👤 User (ធម្មតា)</option>
                              <option value="admin">🛡️ Admin (អ្នកគ្រប់គ្រង)</option>
                              <option value="super_admin">👑 Super Admin</option>
                            </select>
                          </div>
                        </td>

                        {/* Status (Active / Suspended) */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isRootSuper}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                              u.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {u.status === 'active' ? 'Active' : 'Suspended'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleVip(u)}
                              className={`p-2 rounded-lg border transition-all ${
                                u.subscribed
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                  : 'bg-brand-bg border-brand-border text-brand-muted hover:text-amber-400 hover:border-amber-400/50'
                              }`}
                              title={u.subscribed ? 'ដក VIP' : 'ដាក់ VIP ភ្លាមៗ'}
                            >
                              <Crown size={15} />
                            </button>

                            {!isRootSuper && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-2 rounded-lg bg-brand-bg border border-brand-border text-brand-muted hover:text-rose-400 hover:border-rose-400/50 transition-colors"
                                title="លុបអ្នកប្រើប្រាស់"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Grant VIP with Duration */}
      {vipModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setVipModalOpen(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Crown size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-khmer">
                  ដាក់ VIP ជូនសមាជិក
                </h3>
                <p className="text-xs text-brand-muted">{selectedUser.name} ({selectedUser.email})</p>
              </div>
            </div>

            <p className="text-xs text-brand-muted font-khmer mb-4 leading-relaxed">
              ជ្រើសរើសរយៈពេល VIP ដែលអ្នកចង់ផ្តល់ជូនអ្នកប្រើប្រាស់។ អ្នកប្រើប្រាស់នឹងទទួលបានសិទ្ធិមើលគ្រប់វគ្គ និងគ្រប់ខ្សែភាពយន្តកម្រិតខ្ពស់។
            </p>

            <div className="space-y-2 mb-6">
              {[
                { plan: '1 Month VIP', price: '$1 / ខែ', desc: 'សុពលភាព 30 ថ្ងៃ' },
                { plan: '3 Months VIP', price: '$2.80 / 3ខែ', desc: 'សុពលភាព 90 ថ្ងៃ' },
                { plan: '1 Year VIP', price: '$10 / ឆ្នាំ', desc: 'សុពលភាព 365 ថ្ងៃ' },
                { plan: 'Lifetime VIP', price: 'Forever VIP', desc: 'មើលបានរហូត គ្មានដែនកំណត់' },
              ].map((item) => (
                <label
                  key={item.plan}
                  onClick={() => setVipDuration(item.plan)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    vipDuration === item.plan
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="vipDuration"
                      checked={vipDuration === item.plan}
                      onChange={() => setVipDuration(item.plan)}
                      className="accent-amber-400"
                    />
                    <div>
                      <div className="font-bold text-sm text-brand-text">{item.plan}</div>
                      <div className="text-[11px] text-brand-muted font-khmer">{item.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">{item.price}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setVipModalOpen(false)}
                className="px-4 py-2 border border-brand-border text-brand-muted hover:text-white rounded-xl text-xs font-semibold"
              >
                បោះបង់
              </button>
              <button
                onClick={handleApplyVipPlan}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-xs font-khmer shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              >
                <Check size={16} />
                <span>បញ្ជាក់ការដាក់ VIP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New User */}
      {newUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setNewUserModalOpen(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white font-khmer mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-amber-400" />
              <span>បន្ថែមអ្នកប្រើប្រាស់ថ្មី</span>
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-khmer text-brand-muted mb-1">ឈ្មោះ (Name)</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="ឧ. Sok Chan"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2 text-sm text-brand-text outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-khmer text-brand-muted mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ឧ. sokchan@gmail.com"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2 text-sm text-brand-text outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-khmer text-brand-muted mb-1">តួនាទី (Role)</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2 text-sm text-brand-text outline-none focus:border-brand-violet"
                >
                  <option value="user">👤 User (ធម្មតា)</option>
                  <option value="admin">🛡️ Admin (អ្នកគ្រប់គ្រង)</option>
                  <option value="super_admin">👑 Super Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="newUserVipCheck"
                  checked={newUserIsVip}
                  onChange={(e) => setNewUserIsVip(e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
                <label htmlFor="newUserVipCheck" className="text-xs text-brand-text font-khmer cursor-pointer flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-400" />
                  <span>ដាក់ VIP ភ្លាមៗ (Active 1 Month)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setNewUserModalOpen(false)}
                  className="px-4 py-2 border border-brand-border text-brand-muted hover:text-white rounded-xl text-xs font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-violet hover:bg-brand-purple text-white font-bold rounded-xl text-xs font-khmer transition-all"
                >
                  បង្កើតគណនី
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

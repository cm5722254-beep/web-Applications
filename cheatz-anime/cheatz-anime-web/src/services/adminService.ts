import type { User } from '@/types'

export interface ManagedUser {
  id: number
  name: string
  email: string
  avatar: string | null
  roles: string[]
  subscribed: boolean
  subscription_expires_at?: string | null
  subscription_plan?: string | null
  status: 'active' | 'suspended'
  created_at: string
}

const SUPERADMIN_EMAIL = 'socheatvinchan@gmail.com'

const DEFAULT_USERS: ManagedUser[] = [
  {
    id: 1,
    name: 'Socheat Vinchan (Super Admin)',
    email: 'socheatvinchan@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    roles: ['super_admin', 'admin'],
    subscribed: true,
    subscription_plan: 'Lifetime VIP',
    subscription_expires_at: '2099-12-31T23:59:59Z',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Sokha Rith',
    email: 'sokha.rith@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    roles: ['user'],
    subscribed: true,
    subscription_plan: '1 Month VIP',
    subscription_expires_at: '2026-11-15T00:00:00Z',
    status: 'active',
    created_at: '2024-02-14T08:30:00Z',
  },
  {
    id: 3,
    name: 'Bopha Chan',
    email: 'bopha.chan@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    roles: ['user'],
    subscribed: false,
    subscription_plan: null,
    status: 'active',
    created_at: '2024-03-20T11:20:00Z',
  },
  {
    id: 4,
    name: 'Vireak Vong (Moderator)',
    email: 'vireak.vong@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    roles: ['admin'],
    subscribed: true,
    subscription_plan: '1 Year VIP',
    subscription_expires_at: '2027-01-01T00:00:00Z',
    status: 'active',
    created_at: '2024-04-05T09:15:00Z',
  },
  {
    id: 5,
    name: 'Chenda Khem',
    email: 'chenda.khem@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    roles: ['user'],
    subscribed: false,
    subscription_plan: null,
    status: 'active',
    created_at: '2024-05-18T14:40:00Z',
  },
  {
    id: 6,
    name: 'Piseth Meng',
    email: 'piseth.meng@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    roles: ['user'],
    subscribed: true,
    subscription_plan: '3 Months VIP',
    subscription_expires_at: '2026-12-31T00:00:00Z',
    status: 'active',
    created_at: '2024-06-10T16:05:00Z',
  },
]

const USERS_STORAGE_KEY = 'sc_anime_managed_users'

export const adminService = {
  isSuperAdmin(email?: string | null): boolean {
    if (!email) return false
    return email.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
  },

  getUsers(): ManagedUser[] {
    if (typeof window === 'undefined') return DEFAULT_USERS
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
        return DEFAULT_USERS
      }
      const users: ManagedUser[] = JSON.parse(stored)
      // Ensure superadmin is always present and active
      const hasSuperAdmin = users.some(u => u.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase())
      if (!hasSuperAdmin) {
        users.unshift(DEFAULT_USERS[0])
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      }
      return users
    } catch {
      return DEFAULT_USERS
    }
  },

  saveUsers(users: ManagedUser[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  },

  setVip(userId: number, isVip: boolean, plan: string = '1 Month VIP'): ManagedUser | null {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === userId)
    if (index === -1) return null

    let expiresAt: string | null = null
    if (isVip) {
      const date = new Date()
      if (plan.includes('1 Month')) date.setMonth(date.getMonth() + 1)
      else if (plan.includes('3 Months')) date.setMonth(date.getMonth() + 3)
      else if (plan.includes('1 Year')) date.setFullYear(date.getFullYear() + 1)
      else if (plan.includes('Lifetime')) date.setFullYear(date.getFullYear() + 99)
      else date.setMonth(date.getMonth() + 1)
      expiresAt = date.toISOString()
    }

    users[index] = {
      ...users[index],
      subscribed: isVip,
      subscription_plan: isVip ? plan : null,
      subscription_expires_at: expiresAt,
    }

    this.saveUsers(users)
    this.syncCurrentSession(users[index])
    return users[index]
  },

  setRole(userId: number, role: 'user' | 'admin' | 'super_admin'): ManagedUser | null {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === userId)
    if (index === -1) return null

    let roles: string[] = ['user']
    if (role === 'admin') roles = ['user', 'admin']
    else if (role === 'super_admin') roles = ['user', 'admin', 'super_admin']

    users[index] = {
      ...users[index],
      roles,
    }

    this.saveUsers(users)
    this.syncCurrentSession(users[index])
    return users[index]
  },

  toggleStatus(userId: number): ManagedUser | null {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === userId)
    if (index === -1) return null

    users[index] = {
      ...users[index],
      status: users[index].status === 'active' ? 'suspended' : 'active',
    }

    this.saveUsers(users)
    return users[index]
  },

  deleteUser(userId: number): boolean {
    const users = this.getUsers()
    const target = users.find(u => u.id === userId)
    if (target && target.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
      return false // cannot delete root superadmin
    }
    const filtered = users.filter(u => u.id !== userId)
    this.saveUsers(filtered)
    return true
  },

  syncCurrentSession(updatedUser: ManagedUser) {
    if (typeof window === 'undefined') return
    try {
      const authUserStr = localStorage.getItem('auth_user')
      if (authUserStr) {
        const activeUser: User = JSON.parse(authUserStr)
        if (activeUser.email.toLowerCase() === updatedUser.email.toLowerCase() || activeUser.id === updatedUser.id) {
          const synced: User = {
            ...activeUser,
            subscribed: updatedUser.subscribed,
            roles: updatedUser.roles,
            status: updatedUser.status,
          }
          localStorage.setItem('auth_user', JSON.stringify(synced))
          window.dispatchEvent(new Event('auth_updated'))
        }
      }
    } catch {}
  },
}

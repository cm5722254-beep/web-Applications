import { apiClient } from '@/lib/api'
import type { User, AdminUserFilters, AdminUserUpdate, PaginationMeta, UserStatus } from '@/types'

export interface ManagedUser {
  id: number
  name: string
  email: string
  avatar: string | null
  roles: string[]
  subscribed: boolean
  subscription_expires_at?: string | null
  subscription_plan?: string | null
  status: UserStatus
  created_at: string
  login_provider?: 'google' | 'email' | null
  last_login_at?: string | null
}

const SUPERADMIN_EMAILS = [
  'socheatvinchan@gmail.com',
  'socheatvireakchan@gmail.com'
]

// Transform API user to ManagedUser format
function transformUser(apiUser: any): ManagedUser {
  return {
    id: apiUser.id,
    name: apiUser.name || 'Unknown User',
    email: apiUser.email,
    avatar: apiUser.avatar_url || apiUser.avatar || null,
    roles: apiUser.roles?.map((r: any) => r.name || r) || ['user'],
    subscribed: apiUser.subscribed || false,
    subscription_expires_at: apiUser.subscription_expires_at || null,
    subscription_plan: apiUser.subscription_plan || null,
    status: apiUser.status || 'active',
    created_at: apiUser.created_at || new Date().toISOString(),
    login_provider: apiUser.login_provider || null,
    last_login_at: apiUser.last_login_at || null,
  }
}

export const adminService = {
  isSuperAdmin(email?: string | null): boolean {
    if (!email) return false
    const normalized = email.trim().toLowerCase()
    return SUPERADMIN_EMAILS.some(e => e.toLowerCase() === normalized)
  },

  async getUsers(filters?: AdminUserFilters): Promise<{ users: ManagedUser[]; meta: PaginationMeta }> {
    // Use localStorage directly (Vercel serverless doesn't support file system persistence)
    if (typeof window !== 'undefined') {
      const localUsersRaw = localStorage.getItem('sc_anime_managed_users')
      if (localUsersRaw) {
        let allUsers: ManagedUser[] = JSON.parse(localUsersRaw)
        
        // Apply filters
        if (filters?.search) {
          const search = filters.search.toLowerCase()
          allUsers = allUsers.filter(u => 
            u.name.toLowerCase().includes(search) || 
            u.email.toLowerCase().includes(search)
          )
        }
        if (filters?.status) {
          allUsers = allUsers.filter(u => u.status === filters.status)
        }
        if (filters?.role) {
          allUsers = allUsers.filter(u => u.roles.includes(filters.role!))
        }
        if (filters?.subscribed !== undefined) {
          allUsers = allUsers.filter(u => u.subscribed === filters.subscribed)
        }
        
        // Sort by last_login_at descending (most recent first)
        allUsers.sort((a, b) => {
          const aTime = a.last_login_at || a.created_at
          const bTime = b.last_login_at || b.created_at
          return new Date(bTime).getTime() - new Date(aTime).getTime()
        })
        
        // Pagination
        const perPage = filters?.per_page || 20
        const page = filters?.page || 1
        const total = allUsers.length
        const startIndex = (page - 1) * perPage
        const endIndex = startIndex + perPage
        const paginatedUsers = allUsers.slice(startIndex, endIndex)
        
        return {
          users: paginatedUsers,
          meta: {
            current_page: page,
            last_page: Math.ceil(total / perPage),
            per_page: perPage,
            total,
          },
        }
      }
    }
    
    return {
      users: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: filters?.per_page || 20,
        total: 0,
      },
    }
  },

  async getUser(userId: number): Promise<ManagedUser | null> {
    if (typeof window !== 'undefined') {
      const localUsersRaw = localStorage.getItem('sc_anime_managed_users')
      if (localUsersRaw) {
        const users: ManagedUser[] = JSON.parse(localUsersRaw)
        return users.find(u => u.id === userId) || null
      }
    }
    return null
  },

  async updateUser(userId: number, data: AdminUserUpdate): Promise<ManagedUser | null> {
    if (typeof window !== 'undefined') {
      const localUsersRaw = localStorage.getItem('sc_anime_managed_users')
      if (localUsersRaw) {
        const users: ManagedUser[] = JSON.parse(localUsersRaw)
        const index = users.findIndex(u => u.id === userId)
        
        if (index >= 0) {
          const updated: ManagedUser = { ...users[index], ...data } as ManagedUser
          users[index] = updated
          localStorage.setItem('sc_anime_managed_users', JSON.stringify(users))
          this.syncCurrentSession(users[index])
          return users[index]
        }
      }
    }
    return null
  },

  async assignRoles(userId: number, roles: string[]): Promise<ManagedUser | null> {
    return await this.updateUser(userId, { roles })
  },

  async suspendUser(userId: number): Promise<ManagedUser | null> {
    return await this.updateUser(userId, { status: 'suspended' })
  },

  async activateUser(userId: number): Promise<ManagedUser | null> {
    return await this.updateUser(userId, { status: 'active' })
  },

  async setVip(userId: number, isVip: boolean, plan: string = '1 Month VIP'): Promise<ManagedUser | null> {
    try {
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

      return await this.updateUser(userId, {
        subscribed: isVip,
        subscription_plan: isVip ? plan : null,
        subscription_expires_at: expiresAt,
      })
    } catch (error) {
      console.error('Failed to set VIP:', error)
      return null
    }
  },

  async setRole(userId: number, role: 'user' | 'admin' | 'super_admin'): Promise<ManagedUser | null> {
    try {
      let roles: string[] = ['user']
      if (role === 'admin') roles = ['user', 'admin']
      else if (role === 'super_admin') roles = ['user', 'admin', 'super_admin']

      return await this.assignRoles(userId, roles)
    } catch (error) {
      console.error('Failed to set role:', error)
      return null
    }
  },

  async toggleStatus(userId: number): Promise<ManagedUser | null> {
    try {
      // First get current status
      const current = await this.getUser(userId)
      if (!current) return null

      // Call appropriate endpoint based on current status
      if (current.status === 'active') {
        return await this.suspendUser(userId)
      } else {
        return await this.activateUser(userId)
      }
    } catch (error) {
      console.error('Failed to toggle status:', error)
      return null
    }
  },

  async deleteUser(userId: number): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const user = await this.getUser(userId)
      if (user && this.isSuperAdmin(user.email)) {
        return false // cannot delete superadmin
      }

      const localUsersRaw = localStorage.getItem('sc_anime_managed_users')
      if (localUsersRaw) {
        const users: ManagedUser[] = JSON.parse(localUsersRaw)
        const filtered = users.filter(u => u.id !== userId)
        localStorage.setItem('sc_anime_managed_users', JSON.stringify(filtered))
        return true
      }
    }
    return false
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

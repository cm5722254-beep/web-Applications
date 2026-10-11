'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authService } from '@/services/api'
import { clearAuthToken, setAuthToken } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password?: string) => Promise<void>
  loginWithGoogle: (profile?: { name?: string; email?: string; avatar?: string }) => Promise<void>
  loginAsSuperAdmin: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  isAdmin: boolean
  isSuperAdmin: boolean
  isSubscribed: boolean
}

const SUPERADMIN_EMAIL = 'socheatvinchan@gmail.com'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        setUser(null)
        return
      }
      const me = await authService.me()
      setUser(me)
    } catch {
      setUser(null)
      clearAuthToken()
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))

    const handleAuthUpdated = () => {
      refresh()
    }
    window.addEventListener('auth_updated', handleAuthUpdated)
    window.addEventListener('storage', handleAuthUpdated)
    return () => {
      window.removeEventListener('auth_updated', handleAuthUpdated)
      window.removeEventListener('storage', handleAuthUpdated)
    }
  }, [refresh])

  const login = useCallback(async (email: string, password?: string) => {
    const data = await authService.login({ email, password })
    setAuthToken(data.token)
    setUser(data.user)
  }, [])

  const loginAsSuperAdmin = useCallback(async () => {
    const superAdminUser: User = {
      id: 1,
      name: 'Socheat Vinchan (Super Admin)',
      email: SUPERADMIN_EMAIL,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      status: 'active',
      preferred_language: 'km',
      preferred_subtitle_language: 'km',
      ads_enabled: false,
      roles: ['super_admin', 'admin'],
      subscribed: true,
      email_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(superAdminUser))
      localStorage.setItem('auth_token', 'superadmin_token_' + Date.now())
    }
    setAuthToken('superadmin_token_' + Date.now())
    setUser(superAdminUser)
  }, [])

  const loginWithGoogle = useCallback(async (profile?: { name?: string; email?: string; avatar?: string }) => {
    const email = profile?.email || 'user.google@gmail.com'
    const name = profile?.name || 'Google User'
    const avatar = profile?.avatar || 'https://lh3.googleusercontent.com/a/default-user=s96-c'

    const isSuper = email.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
    let existingSubscribed = isSuper ? true : false

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.email?.toLowerCase() === email.toLowerCase()) {
            existingSubscribed = isSuper ? true : (parsed.subscribed ?? false)
          }
        } catch {}
      }
    }

    const googleUser: User = {
      id: isSuper ? 1 : Date.now(),
      name: isSuper ? 'Socheat Vinchan (Super Admin)' : name,
      email,
      avatar,
      status: 'active',
      preferred_language: 'km',
      preferred_subtitle_language: 'km',
      ads_enabled: false,
      roles: isSuper ? ['super_admin', 'admin'] : ['user'],
      subscribed: existingSubscribed,
      email_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(googleUser))
      localStorage.setItem('auth_token', 'google_token_' + Date.now())
    }
    setAuthToken('google_token_' + Date.now())
    setUser(googleUser)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authService.register({
      name,
      email,
      password,
      password_confirmation: password,
    })
    setAuthToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearAuthToken()
      setUser(null)
    }
  }, [])

  const isSuperAdmin = user?.email?.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase() ||
    (user?.roles?.includes('super_admin') ?? false)

  const isAdmin = isSuperAdmin || (user?.roles?.some((r) =>
    ['admin', 'super_admin', 'content_manager', 'subtitle_editor', 'support_agent'].includes(r)
  ) ?? false)

  const isSubscribed = isSuperAdmin || (user?.subscribed ?? false)

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithGoogle,
      loginAsSuperAdmin,
      register,
      logout,
      refresh,
      isAdmin,
      isSuperAdmin,
      isSubscribed
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { clearAuthToken, setAuthToken } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  loginWithGoogle: () => void
  logout: () => void
  refresh: () => void
  isAdmin: boolean
  isSuperAdmin: boolean
  isSubscribed: boolean
}

const SUPERADMIN_EMAILS = [
  'socheatvinchan@gmail.com',
  'socheatvireakchan@gmail.com'
]

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth_user')
    const token = localStorage.getItem('auth_token')
    if (!raw || !token) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const stored = loadUserFromStorage()
    setUser(stored)
    if (stored) {
      const token = localStorage.getItem('auth_token') || ''
      setAuthToken(token)
    } else {
      clearAuthToken()
    }
  }, [])

  useEffect(() => {
    refresh()
    setLoading(false)

    const handleStorageChange = () => refresh()
    window.addEventListener('auth_updated', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('auth_updated', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [refresh])

  // Real Google OAuth — redirects to /api/auth/google which handles full OAuth flow
  const loginWithGoogle = useCallback(() => {
    const redirect = typeof window !== 'undefined' ? window.location.pathname : '/'
    window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    } catch {}
    clearAuthToken()
    setUser(null)
    window.location.href = '/'
  }, [])

  const isSuperAdmin =
    SUPERADMIN_EMAILS.some(email => user?.email?.trim().toLowerCase() === email.toLowerCase()) ||
    (user?.roles?.includes('super_admin') ?? false)

  const isAdmin =
    isSuperAdmin ||
    (user?.roles?.some((r) =>
      ['admin', 'super_admin', 'content_manager', 'subtitle_editor', 'support_agent'].includes(r)
    ) ?? false)

  const isSubscribed = isSuperAdmin || (user?.subscribed ?? false)

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        logout,
        refresh,
        isAdmin,
        isSuperAdmin,
        isSubscribed,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

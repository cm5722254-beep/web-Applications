'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ShieldCheck, Sparkles, Send, CheckCircle2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui'

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = () => {
    setLoading(true)
    window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectTo)}`
  }

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Background Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/18 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.4)] group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <div className="flex items-center">
              <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent block tracking-wide">
                SC-ANIME
              </span>
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                KH
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">
              PRODUCTION STREAMING
            </span>
          </div>
        </Link>
      </div>

      {/* Card */}
      <div className="bg-[#0d0f1a]/95 backdrop-blur-2xl border border-cyan-500/25 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-neutral-400 text-sm">
            Sign in with your Google account to sync watch progress and access all 4K series.
          </p>
        </div>

        {/* Real Continue with Google Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 text-neutral-900 font-bold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 text-base group cursor-pointer"
          >
            {loading ? (
              <LoadingSpinner size={22} />
            ) : (
              <>
                <GoogleIcon />
                <span className="font-sans font-semibold tracking-wide">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-1">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>Secure 1-click Google OAuth verification</span>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-2.5 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-cyan-400" />
            <span>Full HD 1080p & 4K Ultra HD streaming</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-cyan-400" />
            <span>Multi-device watch history synchronization</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-cyan-400" />
            <span>Personal favorites & notification bookmarks</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#07080f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<LoadingSpinner size={40} />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

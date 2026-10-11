'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Global Error Boundary — catches errors in the root layout subtree.
// Next.js 13+ App Router convention: src/app/error.tsx
//
// This also shields against browser-extension runtime errors (e.g. M_ID crash
// from the eppiocemhmnlbhjplcgkofciiegomcon executor) by preventing them from
// fully unloading the React tree.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console in dev; replace with your error-tracking service in prod
    if (process.env.NODE_ENV === 'development') {
      console.error('[GlobalError]', error)
    }
  }, [error])

  // Extension-originated errors (e.g. M_ID) usually have very short, opaque
  // messages. Detect them so we show a more helpful message.
  const isExtensionError =
    error?.stack?.includes('chrome-extension://') ||
    error?.stack?.includes('moz-extension://') ||
    error?.message?.includes('M_ID') ||
    error?.message?.includes('extension') ||
    false

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-600/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <AlertTriangle size={30} className="text-red-400" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white mb-2">
            {isExtensionError ? 'Browser Extension Conflict' : 'Something went wrong'}
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            {isExtensionError
              ? 'A browser extension is interfering with the page. Try disabling extensions, using a Private/Incognito window, or a different browser.'
              : 'An unexpected error occurred. The app can usually recover — try refreshing.'}
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <pre className="mt-4 text-left text-[10px] text-red-400/70 bg-red-950/20 border border-red-500/15 rounded-xl p-3 overflow-auto max-h-32 w-full">
              {error.message}
            </pre>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-5 rounded-xl transition-all shadow-[0_0_18px_rgba(0,212,255,0.35)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0d0f1a] hover:bg-white/5 border border-white/10 text-neutral-300 hover:text-white font-bold py-3 px-5 rounded-xl transition-all"
          >
            <Home size={15} />
            Home
          </Link>
        </div>

        {isExtensionError && (
          <p className="text-xs text-neutral-600 max-w-xs">
            To permanently fix: go to{' '}
            <span className="text-neutral-400">chrome://extensions</span> and disable
            the &quot;Script Executor&quot; or similar extension.
          </p>
        )}
      </div>
    </div>
  )
}

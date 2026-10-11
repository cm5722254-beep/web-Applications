'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Providers — root client context tree.
// Wraps everything in a React ErrorBoundary so browser-extension crashes
// (e.g. the M_ID / eppiocemhmnlbhjplcgkofciiegomcon error) are caught at the
// React boundary level before they unload the whole document.
// ─────────────────────────────────────────────────────────────────────────────

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, Component, type ReactNode, Suspense } from 'react'
import { AuthProvider } from '@/hooks/useAuth'
import { I18nProvider } from '@/i18n'
import { ThemeProvider } from '@/hooks/useTheme'

// ── Query client factory ──────────────────────────────────────────────────
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,          // 1 min
        gcTime:    5 * 60_000,      // 5 min
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

// ── Class-based ErrorBoundary (cannot be a hook) ──────────────────────────
interface EBState { hasError: boolean; error: Error | null }

class ProviderErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    // Only log in dev; in prod, send to error tracking (Sentry, etc.)
    if (process.env.NODE_ENV === 'development') {
      console.error('[ProviderErrorBoundary]', error)
    }
  }

  handleReset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      const isExtension =
        this.state.error?.stack?.includes('chrome-extension://') ||
        this.state.error?.stack?.includes('moz-extension://') ||
        this.state.error?.message?.includes('M_ID')

      return (
        <div className="min-h-screen bg-[#07080f] text-white flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-5 max-w-sm text-center">
            <span className="text-4xl">⚠️</span>
            <h2 className="text-lg font-black">
              {isExtension ? 'Browser Extension Conflict' : 'Something went wrong'}
            </h2>
            <p className="text-sm text-neutral-400">
              {isExtension
                ? 'A browser extension is interfering with SC-ANIME KH. Disable extensions or use a Private window.'
                : 'An error occurred in the app shell. Refresh to try again.'}
            </p>
            <button
              onClick={this.handleReset}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Suspense fallback ─────────────────────────────────────────────────────
function AppShellFallback() {
  return (
    <div className="min-h-screen bg-[#07080f] flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-full border-2 border-white/10 border-t-cyan-500 animate-spin"
        role="status"
        aria-label="Loading application…"
      />
    </div>
  )
}

// ── Main exported Providers component ────────────────────────────────────
export function Providers({ children }: { children: ReactNode }) {
  // useState ensures the client is created only once per component lifecycle
  const [queryClient] = useState(makeQueryClient)

  return (
    <ProviderErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <Suspense fallback={<AppShellFallback />}>
                {children}
              </Suspense>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ProviderErrorBoundary>
  )
}

import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

export function AnimeCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#0d0f1a] border border-white/5">
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('border-2 border-white/10 border-t-cyan-500 rounded-full animate-spin', className)}
      style={{ width: size, height: size }}
    />
  )
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="text-neutral-400 text-sm max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm bg-[#0d0f1a] border border-cyan-500/20 hover:border-cyan-400/40 text-neutral-300 hover:text-cyan-300 px-4 py-2 rounded-xl transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, message, description }: { title?: string; message?: string; description?: string }) {
  const displayTitle = title || message || 'No results'
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="text-5xl opacity-25">🎬</div>
      <h3 className="text-white font-semibold">{displayTitle}</h3>
      {description && <p className="text-neutral-500 text-sm max-w-sm">{description}</p>}
    </div>
  )
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'premium' | 'success' | 'warning' | 'error' }) {
  const variants = {
    default: 'bg-[#0d0f1a] border-cyan-500/15 text-neutral-400',
    premium: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    success: 'bg-green-500/20 border-green-500/40 text-green-400',
    warning: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
    error:   'bg-red-500/20 border-red-500/40 text-red-400',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 border text-xs px-2 py-0.5 rounded-md font-medium', variants[variant])}>
      {children}
    </span>
  )
}

export function Section({ title, subtitle, children, action }: {
  title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{title}</h2>
          {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export { Logo3D } from './Logo3D'

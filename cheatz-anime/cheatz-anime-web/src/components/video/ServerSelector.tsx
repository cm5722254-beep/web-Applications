// ─────────────────────────────────────────────────────────────────────────────
// Server Selector Component — Video source switcher UI
// Shows 8 server options with active highlighting and broken video reporting
// ─────────────────────────────────────────────────────────────────────────────

import { Server, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VideoSource } from '@/types/video'

interface ServerSelectorProps {
  /** All available video sources */
  sources: VideoSource[]
  
  /** Currently active source */
  activeSource: VideoSource | null
  
  /** Loading state while switching sources */
  isLoading: boolean
  
  /** Callback when user selects a source */
  onSourceSelect: (sourceId: string) => void
  
  /** Callback when user reports a broken video */
  onReportBroken: () => void
}

export function ServerSelector({
  sources,
  activeSource,
  isLoading,
  onSourceSelect,
  onReportBroken,
}: ServerSelectorProps) {
  return (
    <div className="w-full bg-[#0d0f1a] border border-white/10 rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Server size={14} className="text-cyan-400" aria-hidden />
          Video Sources
        </h3>
        
        {/* Report Broken Video Button */}
        <button
          onClick={onReportBroken}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded px-2 py-1"
          title="Report this video as broken"
        >
          <AlertCircle size={12} aria-hidden />
          <span className="hidden sm:inline">Report Broken</span>
        </button>
      </div>
      
      {/* Source Buttons Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2"
        role="group"
        aria-label="Video source selection"
      >
        {sources.map((source) => {
          const isActive = activeSource?.id === source.id
          const isDisabled = isLoading
          
          return (
            <button
              key={source.id}
              onClick={() => onSourceSelect(source.id)}
              disabled={isDisabled}
              aria-pressed={isActive}
              aria-label={`Switch to ${source.name} server${isActive ? ' (currently active)' : ''}`}
              className={cn(
                'relative px-3 py-2 rounded-xl text-xs font-bold transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500',
                'disabled:cursor-not-allowed',
                isActive
                  ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(0,212,255,0.5)] scale-105'
                  : 'bg-black/40 text-neutral-400 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/15 disabled:hover:bg-black/40 disabled:hover:border-white/5',
              )}
            >
              {/* Loading Spinner for Active Source */}
              {isActive && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-cyan-600/80 rounded-xl">
                  <Loader2 size={14} className="animate-spin text-white" aria-hidden />
                </div>
              )}
              
              <span className={cn(isActive && isLoading && 'opacity-0')}>
                {source.name}
              </span>
            </button>
          )
        })}
      </div>
      
      {/* Loading Indicator */}
      {isLoading && (
        <p className="text-xs text-cyan-400 text-center font-medium animate-pulse">
          Switching server...
        </p>
      )}
    </div>
  )
}

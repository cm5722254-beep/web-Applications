// ─────────────────────────────────────────────────────────────────────────────
// useVideoSources Hook — Video source management with auto-fallback
// Handles source switching, localStorage preferences, and retry logic
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react'
import type { VideoSource } from '@/types/video'
import { VIDEO_SOURCES, getVideoSourceById } from '@/services/videoSourceFinder'

interface UseVideoSourcesOptions {
  animeSlug: string
  episodeNumber: number
  primaryUrl: string | null
}

interface UseVideoSourcesReturn {
  /** All available video sources */
  sources: VideoSource[]
  
  /** Currently active source */
  activeSource: VideoSource | null
  
  /** Current video URL */
  currentUrl: string | null
  
  /** Loading state while switching/loading sources */
  isLoading: boolean
  
  /** Error message if source loading failed */
  error: string | null
  
  /** Switch to a specific source by ID */
  switchSource: (sourceId: string) => Promise<void>
  
  /** Report the current video as broken */
  reportBroken: () => void
  
  /** Trigger auto-fallback to next source */
  triggerAutoFallback: () => Promise<void>
}

const MAX_RETRIES = 3

/**
 * Custom hook for managing video sources with auto-fallback and localStorage persistence.
 * 
 * @param options - Configuration options
 * @returns Video source management state and actions
 */
export function useVideoSources({
  animeSlug,
  episodeNumber,
  primaryUrl,
}: UseVideoSourcesOptions): UseVideoSourcesReturn {
  const [sources] = useState<VideoSource[]>(VIDEO_SOURCES)
  const [activeSource, setActiveSource] = useState<VideoSource | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const storageKey = `video_server_preference_${animeSlug}_${episodeNumber}`

  // ── Load saved preference or default to primary ──────────────────────────
  useEffect(() => {
    if (!primaryUrl) return

    let savedSourceId: string | null = null
    
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      try {
        savedSourceId = localStorage.getItem(storageKey)
      } catch {
        // localStorage might be blocked
      }
    }
    
    // Find the saved source or default to primary
    const source = savedSourceId
      ? getVideoSourceById(savedSourceId) ?? sources[0]
      : sources[0]
    
    // Load the source
    loadSource(source, primaryUrl).catch(() => {
      // If saved source fails, try primary
      if (source.id !== 'primary') {
        loadSource(sources[0], primaryUrl).catch(console.error)
      }
    })
  }, [animeSlug, episodeNumber, primaryUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load a specific source ───────────────────────────────────────────────
  const loadSource = useCallback(async (
    source: VideoSource,
    baseUrl: string,
  ): Promise<void> => {
    // Abort any in-flight request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Get URL from source
      const url = await Promise.race([
        source.getUrl(baseUrl, animeSlug, episodeNumber),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Source timeout')), 10000)
        ),
      ])
      
      setActiveSource(source)
      setCurrentUrl(url)
      setIsLoading(false)
      setRetryCount(0)
      
      // Save preference to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, source.id)
        } catch {
          // localStorage might be full or blocked
        }
      }
    } catch (err) {
      console.error(`Failed to load source ${source.id}:`, err)
      setError(`Failed to load ${source.name} source`)
      setIsLoading(false)
      throw err
    }
  }, [animeSlug, episodeNumber, storageKey])

  // ── Switch to a different source ─────────────────────────────────────────
  const switchSource = useCallback(async (sourceId: string): Promise<void> => {
    if (!primaryUrl) {
      setError('No primary URL available')
      return
    }
    
    const source = getVideoSourceById(sourceId)
    if (!source) {
      setError('Invalid source')
      return
    }
    
    await loadSource(source, primaryUrl)
  }, [primaryUrl, loadSource])

  // ── Auto-fallback to next available source ───────────────────────────────
  const triggerAutoFallback = useCallback(async (): Promise<void> => {
    if (!primaryUrl || !activeSource) return
    
    // Check retry limit
    if (retryCount >= MAX_RETRIES) {
      setError('All sources exhausted. Please try again later.')
      setIsLoading(false)
      return
    }
    
    setRetryCount((prev) => prev + 1)
    
    // Find next source by priority
    const sortedSources = [...sources].sort((a, b) => a.priority - b.priority)
    const currentIndex = sortedSources.findIndex((s) => s.id === activeSource.id)
    const nextSource = sortedSources[currentIndex + 1] ?? sortedSources[0]
    
    console.log(`Auto-fallback: ${activeSource.name} → ${nextSource.name}`)
    
    try {
      await loadSource(nextSource, primaryUrl)
    } catch (err) {
      // If this source also fails, try the next one
      if (retryCount + 1 < MAX_RETRIES) {
        setTimeout(() => triggerAutoFallback(), 1000)
      } else {
        setError('All sources exhausted. Please try again later.')
        setIsLoading(false)
      }
    }
  }, [primaryUrl, activeSource, retryCount, sources, loadSource])

  // ── Report broken video ──────────────────────────────────────────────────
  const reportBroken = useCallback((): void => {
    console.log('🚨 Broken Video Report:', {
      anime: animeSlug,
      episode: episodeNumber,
      source: activeSource?.name ?? 'Unknown',
      url: currentUrl,
      timestamp: new Date().toISOString(),
    })
    
    // In production, this would send to an API endpoint
    // For now, just log to console and show alert
    if (typeof window !== 'undefined') {
      alert(`Video reported as broken. Our team will review it shortly.\n\nAnime: ${animeSlug}\nEpisode: ${episodeNumber}\nSource: ${activeSource?.name}`)
    }
  }, [animeSlug, episodeNumber, activeSource, currentUrl])

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    sources,
    activeSource,
    currentUrl,
    isLoading,
    error,
    switchSource,
    reportBroken,
    triggerAutoFallback,
  }
}

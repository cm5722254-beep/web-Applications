// ─────────────────────────────────────────────────────────────────────────────
// Video Source Finder — Multiple streaming server resolver
// Provides 8 alternative video sources with auto-fallback support
// ─────────────────────────────────────────────────────────────────────────────

import type { VideoSource, VideoSourceCacheEntry } from '@/types/video'

// ── Cache Configuration ──────────────────────────────────────────────────────
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes
const cache = new Map<string, VideoSourceCacheEntry>()

// ── Video Sources ────────────────────────────────────────────────────────────

/**
 * All available video sources in priority order.
 * Priority 0 = highest (tried first on auto-fallback)
 * 
 * NOTE: Only includes sources that return actual playable embed URLs.
 * Sources returning search pages have been removed for better UX.
 */
export const VIDEO_SOURCES: VideoSource[] = [
  {
    id: 'primary',
    name: 'Primary',
    priority: 0,
    getUrl: (baseUrl) => baseUrl,
  },
  {
    id: 'dailymotion',
    name: 'Dailymotion',
    priority: 1,
    getUrl: async (baseUrl, animeSlug, epNum) => {
      // Try to search Dailymotion API for the episode
      try {
        const animeName = animeSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        const query = `${animeName} Episode ${epNum} English Sub`
        
        const params = new URLSearchParams({
          fields: 'id',
          search: query,
          limit: '3',
          sort: 'relevance',
        })
        
        const res = await fetch(`https://api.dailymotion.com/videos?${params}`, {
          signal: AbortSignal.timeout(5000),
        })
        
        if (res.ok) {
          const json: { list?: Array<{ id: string }> } = await res.json()
          const videoId = json.list?.[0]?.id
          if (videoId) {
            return `https://geo.dailymotion.com/player/xbj0x.html?video=${videoId}&autoplay=1&mute=0`
          }
        }
      } catch {
        // Fallback to baseUrl if search fails
      }
      
      // Return the primary URL as fallback
      return baseUrl
    },
  },
]

// ── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Finds alternative video sources for a given episode.
 * Uses in-memory cache with 30-minute TTL.
 * 
 * @param animeSlug - The anime identifier
 * @param epNum - Episode number
 * @returns Array of video sources sorted by priority
 */
export async function findAlternativeSources(
  animeSlug: string,
  epNum: number,
): Promise<VideoSource[]> {
  const cacheKey = `${animeSlug}-${epNum}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.sources
  }
  
  // Return all sources sorted by priority
  const sources = [...VIDEO_SOURCES].sort((a, b) => a.priority - b.priority)
  
  // Update cache
  cache.set(cacheKey, {
    sources,
    timestamp: Date.now(),
  })
  
  return sources
}

/**
 * Gets a specific video source by ID
 */
export function getVideoSourceById(id: string): VideoSource | null {
  return VIDEO_SOURCES.find((s) => s.id === id) ?? null
}

/**
 * Clears expired entries from the cache
 */
export function cleanupCache(): void {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  cache.forEach((entry, key) => {
    if (now - entry.timestamp >= CACHE_TTL) {
      keysToDelete.push(key)
    }
  })
  
  keysToDelete.forEach((key) => cache.delete(key))
}

// Auto cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 10 * 60 * 1000)
}

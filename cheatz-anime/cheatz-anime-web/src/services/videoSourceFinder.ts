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
  {
    id: 'dailymotion-2',
    name: 'Dailymotion 2',
    priority: 2,
    getUrl: async (baseUrl, animeSlug, epNum) => {
      // Alternative Dailymotion search with different query pattern
      try {
        const animeName = animeSlug.replace(/-/g, ' ')
        const query = `${animeName} ep ${epNum} donghua`
        
        const params = new URLSearchParams({
          fields: 'id',
          search: query,
          limit: '3',
          sort: 'recent',
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
        // Fallback
      }
      
      return baseUrl
    },
  },
  {
    id: 'rumble',
    name: 'Rumble',
    priority: 3,
    getUrl: (baseUrl, animeSlug, epNum) => {
      // Rumble embed pattern (generic - would need actual video IDs)
      // For now, construct a search-based URL
      const animeName = animeSlug.replace(/-/g, ' ')
      const searchQuery = encodeURIComponent(`${animeName} episode ${epNum}`)
      
      // Rumble doesn't have a public API, so we return a placeholder
      // In production, you'd need to scrape or have a database of Rumble video IDs
      return `https://rumble.com/search/video?q=${searchQuery}`
    },
  },
  {
    id: 'odysee',
    name: 'Odysee',
    priority: 4,
    getUrl: (baseUrl, animeSlug, epNum) => {
      // Odysee/LBRY embed pattern
      const animeName = animeSlug.replace(/-/g, '-')
      
      // Construct Odysee embed URL pattern
      // Format: https://odysee.com/$/embed/{channel}/{video-name}
      // For now, return a search URL as we don't have specific video IDs
      const searchQuery = encodeURIComponent(`${animeName} episode ${epNum}`)
      return `https://odysee.com/$/search?q=${searchQuery}`
    },
  },
  {
    id: 'odysee-2',
    name: 'Odysee 2',
    priority: 5,
    getUrl: (baseUrl, animeSlug, epNum) => {
      // Alternative Odysee source with different naming pattern
      const animeName = animeSlug.replace(/-/g, ' ')
      const searchQuery = encodeURIComponent(`${animeName} ep ${epNum} eng sub`)
      return `https://odysee.com/$/search?q=${searchQuery}`
    },
  },
  {
    id: 'okru',
    name: 'OK.ru',
    priority: 6,
    getUrl: (baseUrl, animeSlug, epNum) => {
      // OK.ru embed pattern
      // Format: https://ok.ru/videoembed/{video-id}
      // For now, return search URL as we don't have specific video IDs
      const animeName = animeSlug.replace(/-/g, ' ')
      const searchQuery = encodeURIComponent(`${animeName} episode ${epNum}`)
      return `https://ok.ru/search?q=${searchQuery}`
    },
  },
  {
    id: 'okru-2',
    name: 'OK.ru 2',
    priority: 7,
    getUrl: (baseUrl, animeSlug, epNum) => {
      // Alternative OK.ru source
      const animeName = animeSlug.replace(/-/g, ' ')
      const searchQuery = encodeURIComponent(`${animeName} ep ${epNum} english`)
      return `https://ok.ru/search?q=${searchQuery}`
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

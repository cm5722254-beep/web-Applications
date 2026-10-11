import { apiClient } from '@/lib/api'
import type { VideoHealthEntry, VideoHealthStats, VideoCheckStatus } from '@/types'

// ── Module-level Store ───────────────────────────────────────────────────────
export const videoHealthStore = new Map<number, VideoHealthEntry>()

export const videoHealthStats: VideoHealthStats = {
  total: 0,
  working: 0,
  broken: 0,
  checking: 0,
  fixed: 0,
  unchecked: 0,
  lastScanAt: null,
  scanProgress: 0,
  isScanning: false,
}

// ── Video URL Health Check ───────────────────────────────────────────────────
export async function checkVideoUrl(url: string): Promise<{ ok: boolean; error: string | null }> {
  if (!url || url.trim() === '') {
    return { ok: false, error: 'Empty URL' }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    if (response.ok || (response.status >= 200 && response.status < 400)) {
      return { ok: true, error: null }
    }

    return { ok: false, error: `HTTP ${response.status}` }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { ok: false, error: 'Timeout (5s)' }
    }
    return { ok: false, error: err.message || 'Network error' }
  }
}

// ── Scan All Episodes ────────────────────────────────────────────────────────
export async function scanAllEpisodes(): Promise<void> {
  if (videoHealthStats.isScanning) {
    console.warn('Scan already in progress')
    return
  }

  videoHealthStats.isScanning = true
  videoHealthStats.scanProgress = 0
  videoHealthStats.lastScanAt = new Date().toISOString()

  // Reset counters
  videoHealthStats.total = 0
  videoHealthStats.working = 0
  videoHealthStats.broken = 0
  videoHealthStats.checking = 0
  videoHealthStats.fixed = 0
  videoHealthStats.unchecked = 0

  try {
    // Fetch all anime (paginated)
    let currentPage = 1
    let hasMoreAnime = true
    const allAnime: any[] = []

    while (hasMoreAnime) {
      try {
        const animeResponse = await apiClient.get(`/admin/anime?page=${currentPage}&per_page=50`)
        const animeData = animeResponse.data.data || []
        
        if (Array.isArray(animeData) && animeData.length > 0) {
          allAnime.push(...animeData)
          
          // Check if there's more pages
          const meta = animeResponse.data.meta
          if (meta && meta.current_page < meta.last_page) {
            currentPage++
          } else {
            hasMoreAnime = false
          }
        } else {
          hasMoreAnime = false
        }
      } catch (err) {
        console.error(`Failed to fetch anime page ${currentPage}:`, err)
        hasMoreAnime = false
      }
    }

    // Count total episodes first
    let totalEpisodes = 0
    for (const anime of allAnime) {
      try {
        const episodesResponse = await apiClient.get(`/admin/anime/${anime.id}/episodes`)
        const episodes = episodesResponse.data.data || episodesResponse.data || []
        if (Array.isArray(episodes)) {
          totalEpisodes += episodes.length
        }
      } catch (err) {
        console.error(`Failed to count episodes for anime ${anime.id}:`, err)
      }
    }

    videoHealthStats.total = totalEpisodes
    let checkedCount = 0

    // Now check each episode
    for (const anime of allAnime) {
      try {
        const episodesResponse = await apiClient.get(`/admin/anime/${anime.id}/episodes`)
        const episodes = episodesResponse.data.data || episodesResponse.data || []

        if (!Array.isArray(episodes)) continue

        for (const episode of episodes) {
          const entry: VideoHealthEntry = {
            episodeId: episode.id,
            animeId: anime.id,
            animeSlug: anime.slug,
            animeTitleEn: anime.title_en || anime.title_original || 'Unknown',
            seasonNumber: episode.season_number || 1,
            episodeNumber: episode.episode_number,
            currentUrl: episode.playback_url || null,
            status: 'checking',
            errorDetail: null,
            fixedUrl: null,
            checkedAt: new Date().toISOString(),
          }

          videoHealthStore.set(episode.id, entry)
          videoHealthStats.checking++

          // Check the URL
          if (episode.playback_url) {
            const result = await checkVideoUrl(episode.playback_url)
            entry.status = result.ok ? 'working' : 'broken'
            entry.errorDetail = result.error
            entry.checkedAt = new Date().toISOString()

            if (result.ok) {
              videoHealthStats.working++
            } else {
              videoHealthStats.broken++
            }
          } else {
            entry.status = 'broken'
            entry.errorDetail = 'No playback URL'
            videoHealthStats.broken++
          }

          videoHealthStats.checking--
          videoHealthStore.set(episode.id, entry)

          checkedCount++
          videoHealthStats.scanProgress = Math.round((checkedCount / totalEpisodes) * 100)

          // Rate limiting: 200ms delay between checks
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } catch (err) {
        console.error(`Failed to fetch episodes for anime ${anime.id}:`, err)
      }
    }

    videoHealthStats.scanProgress = 100
  } catch (err) {
    console.error('Scan failed:', err)
  } finally {
    videoHealthStats.isScanning = false
  }
}

// ── Get Health Stats ─────────────────────────────────────────────────────────
export function getHealthStats(): VideoHealthStats {
  return { ...videoHealthStats }
}

// ── Get All Entries ──────────────────────────────────────────────────────────
export function getAllEntries(): VideoHealthEntry[] {
  return Array.from(videoHealthStore.values())
}

// ── Reset Store ──────────────────────────────────────────────────────────────
export function resetStore(): void {
  videoHealthStore.clear()
  videoHealthStats.total = 0
  videoHealthStats.working = 0
  videoHealthStats.broken = 0
  videoHealthStats.checking = 0
  videoHealthStats.fixed = 0
  videoHealthStats.unchecked = 0
  videoHealthStats.lastScanAt = null
  videoHealthStats.scanProgress = 0
  videoHealthStats.isScanning = false
}

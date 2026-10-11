import { apiClient } from '@/lib/api'
import type { VideoHealthEntry, VideoHealthStats, VideoCheckStatus } from '@/types'
import fs from 'fs'
import path from 'path'

// ── Persistence Configuration ────────────────────────────────────────────────
const STORAGE_DIR = path.join(process.cwd(), '.agents', 'video-health')
const STORAGE_FILE = path.join(STORAGE_DIR, 'scan-results.json')

interface PersistedData {
  entries: Array<[number, VideoHealthEntry]>
  stats: VideoHealthStats
}

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

// ── Persistence Helpers ──────────────────────────────────────────────────────
function ensureStorageDir(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true })
    }
  } catch (err) {
    console.error('Failed to create storage directory:', err)
  }
}

function loadFromDisk(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const fileContent = fs.readFileSync(STORAGE_FILE, 'utf-8')
      const data: PersistedData = JSON.parse(fileContent)
      
      // Restore entries
      videoHealthStore.clear()
      if (Array.isArray(data.entries)) {
        data.entries.forEach(([key, value]) => {
          videoHealthStore.set(key, value)
        })
      }
      
      // Restore stats (but reset scanning state)
      if (data.stats) {
        Object.assign(videoHealthStats, data.stats)
        videoHealthStats.isScanning = false // Always reset on load
        videoHealthStats.checking = 0 // Reset checking counter
      }
      
      console.log(`Loaded ${videoHealthStore.size} video health entries from disk`)
    }
  } catch (err) {
    console.error('Failed to load video health data from disk:', err)
  }
}

function saveToDisk(): void {
  try {
    ensureStorageDir()
    
    const data: PersistedData = {
      entries: Array.from(videoHealthStore.entries()),
      stats: { ...videoHealthStats },
    }
    
    // Atomic write: write to temp file first, then rename
    const tempFile = STORAGE_FILE + '.tmp'
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8')
    
    // Atomic rename (overwrites existing file)
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE)
    }
    fs.renameSync(tempFile, STORAGE_FILE)
  } catch (err) {
    console.error('Failed to save video health data to disk:', err)
  }
}

// Load data on module initialization
if (typeof window === 'undefined') {
  // Only load in server-side context
  loadFromDisk()
}

// ── Video URL Health Check ───────────────────────────────────────────────────
export async function checkVideoUrl(url: string): Promise<{ ok: boolean; error: string | null }> {
  if (!url || url.trim() === '') {
    return { ok: false, error: 'Empty URL' }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    // Try HEAD first
    let response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    // If HEAD fails with 403/405, fallback to GET with Range header
    if (response.status === 403 || response.status === 405) {
      const getController = new AbortController()
      const getTimeoutId = setTimeout(() => getController.abort(), 5000)

      response = await fetch(url, {
        method: 'GET',
        signal: getController.signal,
        headers: { 'Range': 'bytes=0-0' },
        redirect: 'follow',
      })

      clearTimeout(getTimeoutId)
    }

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
export async function scanAllEpisodes(authHeader?: string): Promise<void> {
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

  // Create axios config with auth header if provided
  const axiosConfig = authHeader ? { headers: { Authorization: authHeader } } : {}

  try {
    // Fetch all anime (paginated)
    let currentPage = 1
    let hasMoreAnime = true
    const allAnime: any[] = []

    while (hasMoreAnime) {
      try {
        const animeResponse = await apiClient.get(`/admin/anime?page=${currentPage}&per_page=50`, axiosConfig)
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

    // Batch fetch episodes for all anime (50 at a time to avoid overwhelming the server)
    const allEpisodes: any[] = []
    const batchSize = 50

    for (let i = 0; i < allAnime.length; i += batchSize) {
      const batch = allAnime.slice(i, i + batchSize)
      
      const episodePromises = batch.map(anime =>
        apiClient.get(`/admin/anime/${anime.id}/episodes`, axiosConfig)
          .then(res => ({
            animeId: anime.id,
            animeSlug: anime.slug,
            animeTitleEn: anime.title_en || anime.title_original || 'Unknown',
            episodes: res.data.data || res.data || [],
          }))
          .catch(err => {
            console.error(`Failed to fetch episodes for anime ${anime.id}:`, err)
            return {
              animeId: anime.id,
              animeSlug: anime.slug,
              animeTitleEn: anime.title_en || anime.title_original || 'Unknown',
              episodes: [],
            }
          })
      )

      const batchResults = await Promise.allSettled(episodePromises)
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          allEpisodes.push(result.value)
        }
      })

      // Brief delay between batches
      if (i + batchSize < allAnime.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Count total episodes
    let totalEpisodes = 0
    for (const animeData of allEpisodes) {
      if (Array.isArray(animeData.episodes)) {
        totalEpisodes += animeData.episodes.length
      }
    }

    videoHealthStats.total = totalEpisodes
    let checkedCount = 0

    // Now check each episode
    for (const animeData of allEpisodes) {
      const episodes = animeData.episodes
      if (!Array.isArray(episodes)) continue

      for (const episode of episodes) {
          const entry: VideoHealthEntry = {
            episodeId: episode.id,
            animeId: animeData.animeId,
            animeSlug: animeData.animeSlug,
            animeTitleEn: animeData.animeTitleEn,
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

          // Save to disk every 100 episodes
          if (checkedCount % 100 === 0) {
            saveToDisk()
          }

          // Rate limiting: 200ms delay between checks
          await new Promise(resolve => setTimeout(resolve, 200))
        }
    }

    videoHealthStats.scanProgress = 100
    saveToDisk() // Final save after scan completes
  } catch (err) {
    console.error('Scan failed:', err)
    saveToDisk() // Save even on error
  } finally {
    videoHealthStats.isScanning = false
    saveToDisk() // Save final state
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
  saveToDisk()
}

// ── Update Entry (used by routes) ────────────────────────────────────────────
export function updateEntry(episodeId: number, updates: Partial<VideoHealthEntry>): void {
  const entry = videoHealthStore.get(episodeId)
  if (entry) {
    Object.assign(entry, updates)
    videoHealthStore.set(episodeId, entry)
    saveToDisk()
  }
}

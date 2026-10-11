import { apiClient } from '@/lib/api'
import { checkVideoUrl } from './videoHealthService'

// ── Helper: Sleep utility ────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Find Alternative Video Source ────────────────────────────────────────────
export async function findAlternativeSource(
  animeSlug: string,
  episodeNumber: number
): Promise<string | null> {
  // Try 1: Internal API
  try {
    const response = await apiClient.get(`/playback?anime=${animeSlug}&episode=${episodeNumber}`)
    const playbackUrl = response.data?.playback_url || response.data?.data?.playback_url

    if (playbackUrl) {
      const check = await checkVideoUrl(playbackUrl)
      if (check.ok) {
        return playbackUrl
      }
    }
  } catch (err) {
    console.error('Internal API playback failed:', err)
  }

  // Try 2: External animekill API with exponential backoff
  const externalUrl = `https://apis.animekill.com/api/v1/playback?anime=${animeSlug}&episode=${episodeNumber}`
  let retries = 0
  const maxRetries = 3

  while (retries < maxRetries) {
    try {
      const response = await fetch(externalUrl)
      
      // Handle rate limiting
      if (response.status === 429) {
        const backoffMs = Math.pow(2, retries) * 1000 // 1s, 2s, 4s
        console.warn(`Rate limited by animekill.com, retrying in ${backoffMs}ms...`)
        await sleep(backoffMs)
        retries++
        continue
      }
      
      if (response.ok) {
        const data = await response.json()
        const playbackUrl = data?.playback_url || data?.data?.playback_url

        if (playbackUrl) {
          const check = await checkVideoUrl(playbackUrl)
          if (check.ok) {
            return playbackUrl
          }
        }
      }
      
      // Non-retryable error, break out
      break
    } catch (err) {
      console.error(`External animekill API failed (attempt ${retries + 1}):`, err)
      
      // Retry on network errors with backoff
      if (retries < maxRetries - 1) {
        const backoffMs = Math.pow(2, retries) * 1000
        await sleep(backoffMs)
        retries++
      } else {
        break
      }
    }
  }

  return null
}

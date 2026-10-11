import { apiClient } from '@/lib/api'
import { checkVideoUrl } from './videoHealthService'

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

  // Try 2: External animekill API
  try {
    const externalUrl = `https://apis.animekill.com/api/v1/playback?anime=${animeSlug}&episode=${episodeNumber}`
    const response = await fetch(externalUrl)
    
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
  } catch (err) {
    console.error('External animekill API failed:', err)
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Source Types — Multiple streaming server support
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Represents a video streaming source/server.
 * Each source knows how to construct URLs for a given episode.
 */
export interface VideoSource {
  /** Unique identifier for this source (e.g., 'primary', 'dailymotion', 'rumble') */
  id: string

  /** Display name shown in UI (e.g., 'Primary', 'Dailymotion', 'Rumble') */
  name: string

  /** Priority order for auto-fallback (lower = higher priority, 0 = highest) */
  priority: number

  /**
   * Constructs the video URL for a specific episode.
   * @param baseUrl - The primary URL from /api/playback (used by 'primary' source)
   * @param animeSlug - The anime slug identifier
   * @param epNum - The episode number
   * @returns Video URL (can be async if it needs to fetch/search)
   */
  getUrl: (baseUrl: string, animeSlug: string, epNum: number) => string | Promise<string>
}

/**
 * Cache entry for alternative video sources
 */
export interface VideoSourceCacheEntry {
  sources: VideoSource[]
  timestamp: number
}

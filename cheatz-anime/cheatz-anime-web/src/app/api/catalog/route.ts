import { NextResponse } from 'next/server'

// ─── 5-minute server-side cache ───────────────────────────────────────────────
let cache: { data: CatalogLatestItem[]; ts: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export interface CatalogLatestItem {
  epSlug: string
  epNum: number
  title: string
  animeSlug: string
  poster: string
  video_url?: string | null
}

// ─── Scrape one episode page for its video URL ───────────────────────────────
async function fetchVideoUrl(
  epSlug: string
): Promise<string | null> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 5000)
    const res = await fetch(`https://animekill.com/${epSlug}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        RSC: '1',
        Accept: 'text/x-component, */*',
      },
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!res.ok) return null
    const text = await res.text()

    // video_host + video_path
    const mHostPath = text.match(/"video_host":"([^"]+)","video_path":"([^"]+)"/)
    if (mHostPath?.[1] && mHostPath?.[2]) {
      const h = mHostPath[1].replace(/\\/g, '')
      const p = mHostPath[2].replace(/\\u0026/g, '&').replace(/\\/g, '')
      return h.startsWith('http') ? `${h}${p}` : `https://${h}${p}`
    }
    // playing.donghuaworld.in
    const mDong = text.match(/(https?:\/\/playing\.donghuaworld\.in\/[^\s"'\\<>]+)/)
    if (mDong?.[1]) return mDong[1].replace(/\\/g, '')
    // geo.dailymotion player
    const mGeo = text.match(/(https:\/\/geo\.dailymotion\.com\/player\/[^\s"'\\<>]+)/)
    if (mGeo?.[1]) return mGeo[1].replace(/\\u0026/g, '&').replace(/\\/g, '')
    // dailymotion embed
    const mDm = text.match(/(https?:\/\/(?:www\.)?dailymotion\.com\/embed\/video\/[a-zA-Z0-9_-]+[^\s"'\\<>]*)/)
    if (mDm?.[1]) return mDm[1].replace(/\\u0026/g, '&').replace(/\\/g, '')
    // ok.ru
    const mOk = text.match(/(https?:\/\/ok\.ru\/videoembed\/[0-9]+[^\s"'\\<>]*)/)
    if (mOk?.[1]) return mOk[1].replace(/\\u0026/g, '&').replace(/\\/g, '')
  } catch (_e) {}
  return null
}

// ─── Fetch latest episodes from animekill home API ──────────────────────────
async function fetchLatest(): Promise<CatalogLatestItem[]> {
  const APIS = [
    'https://apis.animekill.com',
    'https://staging.animekill.com',
  ]

  for (const base of APIS) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 6000)
      const res = await fetch(`${base}/users/fetchHomePageAnimeTv`, {
        signal: ctrl.signal,
      })
      clearTimeout(t)
      if (!res.ok) continue
      const json = await res.json()
      const data = json.data || {}

      // Collect recently updated items from both Chinese and Japanese
      const rawItems: Array<{
        anime_id?: string
        name?: string
        small_poster?: string
        large_poster?: string
        next_episode_trailer_number?: number
        max_episode_number?: number
      }> = [
        ...(data.recentlyUpdateChinese || []),
        ...(data.recentlyUpdateJapnese || []),
        ...(data.topBannerAnime || []),
      ]

      const seen = new Set<string>()
      const items: CatalogLatestItem[] = []

      for (const item of rawItems) {
        if (!item.anime_id || !item.name) continue
        if (seen.has(item.anime_id)) continue
        seen.add(item.anime_id)

        const epNum =
          item.next_episode_trailer_number ||
          item.max_episode_number ||
          1

        const epSlug = `${item.anime_id}-episode-${epNum}`
        const poster =
          item.large_poster && item.large_poster !== 'na'
            ? item.large_poster
            : item.small_poster && item.small_poster !== 'na'
            ? item.small_poster
            : `https://animekill.com/poster/${item.anime_id}-hd.webp`

        items.push({
          epSlug,
          epNum,
          title: item.name.trim(),
          animeSlug: item.anime_id,
          poster,
        })
      }

      // Enrich top 12 items with video URLs concurrently
      const top = items.slice(0, 12)
      const rest = items.slice(12)

      const enriched = await Promise.allSettled(
        top.map(async (item) => {
          const video_url = await fetchVideoUrl(item.epSlug)
          return { ...item, video_url }
        })
      )

      const topFilled = enriched.map((r, i) =>
        r.status === 'fulfilled' ? r.value : top[i]
      )

      return [...topFilled, ...rest]
    } catch (_e) {
      continue
    }
  }

  return []
}

// ─── GET /api/catalog ─────────────────────────────────────────────────────────
export async function GET() {
  const now = Date.now()

  if (cache && now - cache.ts < CACHE_TTL) {
    return NextResponse.json({
      ok: true,
      cached: true,
      updated_at: new Date(cache.ts).toISOString(),
      count: cache.data.length,
      latest: cache.data,
    })
  }

  const latest = await fetchLatest()
  cache = { data: latest, ts: now }

  return NextResponse.json({
    ok: true,
    cached: false,
    updated_at: new Date(now).toISOString(),
    count: latest.length,
    latest,
  })
}

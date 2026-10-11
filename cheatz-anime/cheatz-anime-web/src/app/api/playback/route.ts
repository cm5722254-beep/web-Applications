import { NextRequest, NextResponse } from 'next/server'

// ─── In-memory cache — persists across requests within the same server process ───
const playbackCache = new Map<
  string,
  { playback_url: string; type: 'hls' | 'mp4' | 'embed'; ts: number }
>()
const CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours

// ─── Pre-filled verified streams (latest episodes) ──────────────────────────
const PREFILLED: Record<string, { playback_url: string; type: 'embed' | 'hls' | 'mp4' }> = {
  'tales-of-herding-gods-104': {
    playback_url: 'https://geo.dailymotion.com/player/xbj0x.html?video=k7EQenfojRv0sXLqOOC',
    type: 'embed',
  },
  'tales-of-herding-gods-103': {
    playback_url: 'https://geo.dailymotion.com/player/x110cm.html?video=k5Tn5UULu9LFneL0oLc',
    type: 'embed',
  },
  'tales-of-herding-gods-102': {
    playback_url: 'https://geo.dailymotion.com/player/x110cm.html?video=k2v05Gn5BBzfpVKxwqG',
    type: 'embed',
  },
  'tales-of-herding-gods-1': {
    playback_url:
      'https://www.dailymotion.com/embed/video/x983o9q?autoplay=1&subtitles-default=en&mute=false',
    type: 'embed',
  },
  'tales-of-herding-gods-50': {
    playback_url: 'https://www.dailymotion.com/embed/video/k7JzamWXohwNagDVQwM',
    type: 'embed',
  },
  'dragon-master-dragon-master-anime-107': {
    playback_url: 'https://www.dailymotion.com/embed/video/k2TodZR82L6n4JLr9IK',
    type: 'embed',
  },
  'against-the-gods-2-1': {
    playback_url: 'https://ok.ru/videoembed/5988460071520?autoplay=1',
    type: 'embed',
  },
  'soul-land-2-ii-jueshi-tangmen-1': {
    playback_url: 'https://www.dailymotion.com/embed/video/x8m0aki',
    type: 'embed',
  },
  'super-god-gene-genetic-evolution-1': {
    playback_url: 'https://www.dailymotion.com/embed/video/k4mRYOaMqDTw6JBDh9W',
    type: 'embed',
  },
}

const now = Date.now()
for (const [k, v] of Object.entries(PREFILLED)) {
  playbackCache.set(k, { ...v, ts: now })
}

// ─── Extract stream URL from RSC / HTML payload ──────────────────────────────
function extractStream(
  text: string
): { url: string; type: 'embed' | 'hls' | 'mp4' } | null {
  // 1. video_host + video_path (animekill native format)
  const mHostPath = text.match(/"video_host":"([^"]+)","video_path":"([^"]+)"/)
  if (mHostPath?.[1] && mHostPath?.[2]) {
    const host = mHostPath[1].replace(/\\\//g, '/').replace(/\\/g, '')
    const path = mHostPath[2].replace(/\\u0026/g, '&').replace(/\\/g, '')
    const full = host.startsWith('http') ? `${host}${path}` : `https://${host}${path}`
    const type = full.includes('.m3u8') ? 'hls' : full.endsWith('.mp4') ? 'mp4' : 'embed'
    return { url: full, type }
  }

  // 2. playing.donghuaworld.in
  const mDonghua = text.match(/(https?:\/\/playing\.donghuaworld\.in\/[^\s"'\\<>]+)/)
  if (mDonghua?.[1]) {
    return { url: mDonghua[1].replace(/\\u0026/g, '&').replace(/\\/g, ''), type: 'embed' }
  }

  // 3. geo.dailymotion.com player
  const mGeoPlayer = text.match(
    /(https:\/\/geo\.dailymotion\.com\/player\/[^\s"'\\<>]+)/
  )
  if (mGeoPlayer?.[1]) {
    return { url: mGeoPlayer[1].replace(/\\u0026/g, '&').replace(/\\/g, ''), type: 'embed' }
  }

  // 4. dailymotion embed
  const mDailyEmbed = text.match(
    /(https?:\/\/(?:www\.)?dailymotion\.com\/embed\/video\/[a-zA-Z0-9_-]+[^\s"'\\<>]*)/
  )
  if (mDailyEmbed?.[1]) {
    return { url: mDailyEmbed[1].replace(/\\u0026/g, '&').replace(/\\/g, ''), type: 'embed' }
  }

  // 5. ok.ru videoembed
  const mOkRu = text.match(/(https?:\/\/ok\.ru\/videoembed\/[0-9]+[^\s"'\\<>]*)/)
  if (mOkRu?.[1]) {
    return { url: mOkRu[1].replace(/\\u0026/g, '&').replace(/\\/g, ''), type: 'embed' }
  }

  // 6. rumble
  const mRumble = text.match(/(https?:\/\/rumble\.com\/embed\/[a-zA-Z0-9_-]+)/)
  if (mRumble?.[1]) return { url: mRumble[1], type: 'embed' }

  // 7. Direct HLS / MP4
  const mDirect = text.match(
    /(https?:\/\/[^\s"'\\<>]+\.(?:m3u8|mp4)(?:\?[^\s"'\\<>]*)?)/
  )
  if (mDirect?.[1]) {
    const u = mDirect[1].replace(/\\u0026/g, '&').replace(/\\/g, '')
    return { url: u, type: u.includes('.m3u8') ? 'hls' : 'mp4' }
  }

  // 8. Generic embed / player URL
  const mGeneric = text.match(
    /(https?:\/\/[^\s"'\\<>]*(?:player|embed|stream)[^\s"'\\<>]*)/
  )
  if (mGeneric?.[1] && !mGeneric[1].includes('animekill.com')) {
    return { url: mGeneric[1].replace(/\\u0026/g, '&').replace(/\\/g, ''), type: 'embed' }
  }

  return null
}

// ─── Scrape animekill.com episode page via RSC ───────────────────────────────
async function scrapeAnimeKill(
  epSlug: string
): Promise<{ url: string; type: 'embed' | 'hls' | 'mp4' } | null> {
  const baseUrl = `https://animekill.com/${epSlug}`

  // First attempt — RSC fetch (returns raw JSON stream with all episode data)
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 7000)
    const res = await fetch(baseUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        RSC: '1',
        'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
        Accept: 'text/x-component, */*',
      },
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (res.ok) {
      const text = await res.text()
      const found = extractStream(text)
      if (found) return found
    }
  } catch (_e) { /* try fallback */ }

  // Second attempt — plain HTML GET
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 6000)
    const res = await fetch(baseUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,*/*',
      },
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (res.ok) {
      const text = await res.text()
      const found = extractStream(text)
      if (found) return found
    }
  } catch (_e) { /* fallback */ }

  return null
}

// ─── Build all likely slug candidates for an anime + episode ─────────────────
function buildCandidates(animeSlug: string, epNum: number): string[] {
  const clean = animeSlug
    .replace(/-s\d+$/, '')       // remove trailing -s1, -s2
    .replace(/-season-\d+$/, '') // remove trailing -season-1

  const candidates: string[] = []

  // Format: {anime-slug}-episode-{N}  (most common on animekill)
  candidates.push(`${animeSlug}-episode-${epNum}`)
  if (clean !== animeSlug) candidates.push(`${clean}-episode-${epNum}`)

  // Format: {anime-slug}-s1-episode-{N}
  candidates.push(`${animeSlug}-s1-episode-${epNum}`)
  if (clean !== animeSlug) candidates.push(`${clean}-s1-episode-${epNum}`)

  return candidates
}

// ─── GET /api/playback?anime=SLUG&episode=NUM ────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const animeSlug = (searchParams.get('anime') || searchParams.get('slug') || '')
    .toLowerCase()
    .trim()
  const epParam = searchParams.get('episode') || searchParams.get('ep') || '1'
  const epNum = parseInt(epParam.replace(/\D/g, ''), 10) || 1

  if (!animeSlug) {
    return NextResponse.json({ error: 'Missing anime slug' }, { status: 400 })
  }

  const cacheKey = `${animeSlug}-${epNum}`

  // Return from cache if still fresh
  const cached = playbackCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({
      playback_url: cached.playback_url,
      type: cached.type,
      source: 'cache',
      expires_at: new Date(cached.ts + CACHE_TTL).toISOString(),
      subtitles: [],
    })
  }

  // Build candidate episode page slugs and scrape
  const candidates = buildCandidates(animeSlug, epNum)

  for (const candidate of candidates) {
    const result = await scrapeAnimeKill(candidate)
    if (result) {
      playbackCache.set(cacheKey, {
        playback_url: result.url,
        type: result.type,
        ts: Date.now(),
      })

      return NextResponse.json({
        playback_url: result.url,
        type: result.type,
        source: 'live',
        expires_at: new Date(Date.now() + CACHE_TTL).toISOString(),
        subtitles: [],
      })
    }
  }

  // Graceful fallback — a working Tales of Herding Gods stream
  const fallback = 'https://geo.dailymotion.com/player/xbj0x.html?video=k7EQenfojRv0sXLqOOC'
  return NextResponse.json({
    playback_url: fallback,
    type: 'embed',
    source: 'fallback',
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    subtitles: [],
  })
}

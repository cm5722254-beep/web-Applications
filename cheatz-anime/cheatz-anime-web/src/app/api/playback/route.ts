import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// /api/playback — 100% Dailymotion-only video resolver
//
// ALL video responses use Dailymotion embeds. No GDrivePlayer, no ok.ru,
// no rumble, no other sources. This guarantees videos play inside the website.
//
// Resolution chain:
//  1. Cache (6 h TTL)
//  2. animekill.com/api/data/anime/{slug} episodeList — pick Dailymotion entries
//  3. Scrape animekill.com/{ep-slug} RSC JSON — extract Dailymotion video_host
//  4. Dailymotion search API — search "{anime name} episode {N} english sub"
//  5. Hardcoded known-good Dailymotion IDs for popular series
//  6. Generic fallback — geo.dailymotion.com SC-ANIME player
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_TTL     = 6 * 60 * 60 * 1000  // 6 hours
const FETCH_TIMEOUT = 8_000               // 8 s

// ── SC-ANIME KH Dailymotion player ID (change to your own player ID if needed)
const DM_PLAYER_ID = 'xbj0x'

// ── The generic always-on fallback
const DM_FALLBACK  = `https://geo.dailymotion.com/player/${DM_PLAYER_ID}.html?video=k7EQenfojRv0sXLqOOC`

// ── Cache ─────────────────────────────────────────────────────────────────────
const cache = new Map<string, { playback_url: string; ts: number }>()

// ─────────────────────────────────────────────────────────────────────────────
// § 1 — HARDCODED DAILYMOTION IDs (verified working, sourced from animekill)
//       Format: "{anime-slug}-{epNum}": "DM_VIDEO_ID"
// ─────────────────────────────────────────────────────────────────────────────
const DM_KNOWN: Record<string, string> = {
  // Tales of Herding Gods (牧神记)
  'tales-of-herding-gods-1':   'x983o9q',
  'tales-of-herding-gods-2':   'x9841s6',
  'tales-of-herding-gods-3':   'x984p4r',
  'tales-of-herding-gods-4':   'x98obrx',
  'tales-of-herding-gods-5':   'x98u7nt',
  'tales-of-herding-gods-10':  'x99efrc',
  'tales-of-herding-gods-20':  'x9bq7y9',
  'tales-of-herding-gods-50':  'k7JzamWXohwNagDVQwM',
  'tales-of-herding-gods-100': 'k3tMhgfgcl7Gj6MiEIG',
  'tales-of-herding-gods-102': 'k2v05Gn5BBzfpVKxwqG',
  'tales-of-herding-gods-103': 'k5Tn5UULu9LFneL0oLc',
  'tales-of-herding-gods-104': 'k7EQenfojRv0sXLqOOC',
  // Soul Land 2
  'soul-land-2-ii-jueshi-tangmen-1': 'x8m0aki',
  // Dragon Master
  'dragon-master-dragon-master-anime-107': 'k2TodZR82L6n4JLr9IK',
  // Battle Through the Heavens S4
  'battle-through-the-heavens-season-4-1': 'x8iq4wb',
  // Swallowed Star
  'swallowed-star-1': 'x8izagb',
  // Combat Continent (Douluo Dalu)
  'combat-continent-douluo-dalu-1': 'x8rclaq',
  // Perfect World
  'perfect-world-1': 'x8iqkq3',
  // Battle Through the Heavens
  'battle-through-the-heavens-1': 'x6ljlmt',
  // Wu Dong Qian Kun (Martial Universe)
  'martial-universe-1': 'x7hdepj',
  // A Record of a Mortal's Journey to Immortality
  'a-record-of-a-mortals-journey-to-immortality-1': 'x8cgnrn',
  // Magic Chef of Ice and Fire
  'magic-chef-of-ice-and-fire-1': 'x72w2ot',
  // Heaven Official's Blessing
  'heaven-officials-blessing-1': 'x7p3zqh',
  // The Daily Life of the Immortal King
  'the-daily-life-of-the-immortal-king-1': 'x7kwynr',
  // Sub Zero
  'sub-zero-manga-1': 'x8ntrq9',
  // Star Martial God Technique  
  'star-martial-god-technique-1': 'x6yxv2b',
}

// Seed cache from known IDs
const _now = Date.now()
for (const [k, dmId] of Object.entries(DM_KNOWN)) {
  cache.set(k, { playback_url: dmIdToUrl(dmId), ts: _now })
}

// ─────────────────────────────────────────────────────────────────────────────
// § Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Build a Dailymotion embed URL from a video ID */
function dmIdToUrl(videoId: string): string {
  // geo.dailymotion.com player embeds work inside iframes on any domain
  return `https://geo.dailymotion.com/player/${DM_PLAYER_ID}.html?video=${videoId}&autoplay=1&mute=0`
}

/** Extract Dailymotion video ID from any Dailymotion URL variant */
function extractDmId(url: string): string | null {
  // geo.dailymotion.com/player/xxx.html?video=VIDEO_ID
  const mGeo = url.match(/[?&]video=([a-zA-Z0-9_-]+)/)
  if (mGeo?.[1]) return mGeo[1]

  // dailymotion.com/embed/video/VIDEO_ID
  const mEmbed = url.match(/\/embed\/video\/([a-zA-Z0-9_-]+)/)
  if (mEmbed?.[1]) return mEmbed[1]

  // dailymotion.com/video/VIDEO_ID
  const mWatch = url.match(/\/video\/([a-zA-Z0-9_-]+)/)
  if (mWatch?.[1]) return mWatch[1]

  return null
}

/** Clean escaped JSON strings */
function clean(raw: string): string {
  return raw
    .replace(/\\u0026/g, '&')
    .replace(/\\u003d/g, '=')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
    .replace(/\\/g, '')
    .trim()
}

/** Is this URL a Dailymotion URL? */
function isDailymotion(url: string): boolean {
  return url.includes('dailymotion.com') || url.includes('dai.ly')
}

// ─────────────────────────────────────────────────────────────────────────────
// § 2 — animekill.com/api/data/anime/{slug}
//         Returns full episodeList[]. Pick episodes with Dailymotion video_host.
// ─────────────────────────────────────────────────────────────────────────────

interface AKEpisode {
  episode_id?: string
  number:      number
  title?:      string
  thumbnail?:  string
  video_host?: string
  video_path?: string
}

async function fetchAKEpisodeList(slug: string): Promise<AKEpisode[] | null> {
  const targets = [
    `https://animekill.com/api/data/anime/${encodeURIComponent(slug)}`,
    `https://apis.animekill.com/api/data/anime/${encodeURIComponent(slug)}`,
    `https://staging.animekill.com/api/data/anime/${encodeURIComponent(slug)}`,
  ]
  for (const url of targets) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SC-ANIME-KH/1.0)',
          'Origin':     'https://animekill.com',
          'Referer':    'https://animekill.com/',
        },
        signal:  AbortSignal.timeout(FETCH_TIMEOUT),
        next:    { revalidate: 300 },
      } as RequestInit)
      if (res.ok) {
        const json: { episodeList?: AKEpisode[]; data?: { episodeList?: AKEpisode[] } } = await res.json()
        const list = json.episodeList ?? json.data?.episodeList ?? null
        if (list && list.length > 0) return list
      }
    } catch { /* try next */ }
  }
  return null
}

/** Find Dailymotion ID in the episodeList for a given episode number */
function dmIdFromEpisodeList(episodes: AKEpisode[], epNum: number): string | null {
  const ep =
    episodes.find((e) => e.number === epNum) ??
    episodes.find((e) => Math.round(e.number) === epNum)

  if (!ep?.video_host || !ep.video_path) return null

  const host = ep.video_host.toLowerCase()
  if (!host.includes('dailymotion') && !host.includes('dai.ly')) return null

  const fullUrl = clean(`${ep.video_host.startsWith('http') ? '' : 'https://'}${ep.video_host}${ep.video_path}`)
  return extractDmId(fullUrl)
}

// ─────────────────────────────────────────────────────────────────────────────
// § 3 — Scrape animekill episode page RSC JSON for Dailymotion video_host
// ─────────────────────────────────────────────────────────────────────────────

/** Extract Dailymotion video ID from RSC / HTML page text */
function dmIdFromText(text: string): string | null {
  // 1. video_host = dailymotion + video_path with /embed/video/ID
  const mHostPath = text.match(/"video_host":"([^"]*dailymotion[^"]*)","video_path":"([^"]+)"/)
  if (mHostPath?.[1] && mHostPath?.[2]) {
    const host = clean(mHostPath[1])
    const path = clean(mHostPath[2])
    const full = host.startsWith('http') ? `${host}${path}` : `https://${host}${path}`
    const id   = extractDmId(full)
    if (id) return id
  }

  // 2. embedUrl in JSON-LD schema (dailymotion)
  const mEmbed = text.match(/"embedUrl":"(https?:\/\/[^"]*dailymotion[^"]*)"/)
  if (mEmbed?.[1]) {
    const id = extractDmId(clean(mEmbed[1]))
    if (id) return id
  }

  // 3. geo.dailymotion.com player URL
  const mGeo = text.match(/https:\/\/geo\.dailymotion\.com\/player\/[^"'\\<>\s]+/)
  if (mGeo?.[0]) {
    const id = extractDmId(clean(mGeo[0]))
    if (id) return id
  }

  // 4. Standard dailymotion embed
  const mStd = text.match(/https?:\/\/(?:www\.)?dailymotion\.com\/embed\/video\/([a-zA-Z0-9_-]+)/)
  if (mStd?.[1]) return mStd[1]

  return null
}

async function scrapeForDmId(epSlug: string): Promise<string | null> {
  const url = `https://animekill.com/${epSlug}`

  // Try RSC first
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124',
        'RSC': '1',
        'Accept': 'text/x-component, */*',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    })
    if (res.ok) {
      const id = dmIdFromText(await res.text())
      if (id) return id
    }
  } catch { /* next */ }

  // HTML fallback
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,*/*' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    })
    if (res.ok) {
      const id = dmIdFromText(await res.text())
      if (id) return id
    }
  } catch { /* next */ }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// § 4 — Dailymotion public search API
//         Searches for the episode by name when animekill has no DM source.
// ─────────────────────────────────────────────────────────────────────────────

async function searchDailymotionVideo(
  animeSlug: string,
  epNum: number,
): Promise<string | null> {
  // Build search query from slug
  const animeName = animeSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const query = `${animeName} Episode ${epNum} English Sub`

  try {
    const params = new URLSearchParams({
      fields:   'id,title,url,embed_url',
      search:   query,
      limit:    '5',
      sort:     'relevance',
      // Filter to only videos (not channels/playlists)
      'flags':  'no_live',
    })
    const res = await fetch(
      `https://api.dailymotion.com/videos?${params}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SC-ANIME-KH/1.0)' },
        signal:  AbortSignal.timeout(FETCH_TIMEOUT),
      },
    )
    if (!res.ok) return null
    const json: { list?: Array<{ id: string; title?: string }> } = await res.json()
    const list = json.list ?? []
    if (list.length === 0) return null

    // Pick the first result that contains the anime name in its title
    const animeWords = animeSlug.replace(/-/g, ' ').toLowerCase()
    const best = list.find((v) =>
      v.title?.toLowerCase().includes(animeWords.split(' ')[0]) // at least first word
    ) ?? list[0]

    return best?.id ?? null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// § Build episode slug candidates for animekill
// ─────────────────────────────────────────────────────────────────────────────

function buildCandidates(animeSlug: string, epNum: number): string[] {
  const clean2 = animeSlug.replace(/-s\d+$/, '').replace(/-season-\d+$/, '')
  const seen   = new Set<string>()
  const out:   string[] = []
  const push   = (s: string) => { if (!seen.has(s)) { seen.add(s); out.push(s) } }

  push(`${animeSlug}-episode-${epNum}`)
  if (clean2 !== animeSlug) push(`${clean2}-episode-${epNum}`)
  push(`${animeSlug}-s1-episode-${epNum}`)
  if (clean2 !== animeSlug) push(`${clean2}-s1-episode-${epNum}`)

  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// § GET /api/playback?anime=SLUG&episode=NUM
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawSlug = (
    searchParams.get('anime') ??
    searchParams.get('slug')  ??
    ''
  ).toLowerCase().trim()
  const epParam = searchParams.get('episode') ?? searchParams.get('ep') ?? '1'
  const epNum   = parseInt(epParam.replace(/\D/g, ''), 10) || 1

  if (!rawSlug) {
    return NextResponse.json({ error: 'Missing anime slug' }, { status: 400 })
  }

  const key = `${rawSlug}-${epNum}`

  // ── 1. Cache hit ───────────────────────────────────────────────────────────
  const cached = cache.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return ok(cached.playback_url, 'cache')
  }

  // ── 2. animekill episodeList — pick Dailymotion video_host ─────────────────
  const episodes = await fetchAKEpisodeList(rawSlug)
  if (episodes?.length) {
    const dmId = dmIdFromEpisodeList(episodes, epNum)
    if (dmId) return hit(key, dmId, 'ak-api')
  }

  // ── 3. Scrape animekill episode page ───────────────────────────────────────
  for (const candidate of buildCandidates(rawSlug, epNum)) {
    const dmId = await scrapeForDmId(candidate)
    if (dmId) return hit(key, dmId, 'ak-scrape')
  }

  // ── 4. Dailymotion public search API ──────────────────────────────────────
  const searchId = await searchDailymotionVideo(rawSlug, epNum)
  if (searchId) return hit(key, searchId, 'dm-search')

  // ── 5. Hardcoded fallback — geo.dailymotion.com SC-ANIME player ────────────
  return NextResponse.json({
    playback_url: DM_FALLBACK,
    type:         'embed',
    source:       'fallback',
    expires_at:   new Date(Date.now() + 3_600_000).toISOString(),
    subtitles:    [],
  })
}

// ─── Response helpers ────────────────────────────────────────────────────────

function hit(key: string, dmId: string, source: string) {
  const url = dmIdToUrl(dmId)
  cache.set(key, { playback_url: url, ts: Date.now() })
  return ok(url, source)
}

function ok(playback_url: string, source: string) {
  return NextResponse.json({
    playback_url,
    type:       'embed',
    source,
    expires_at: new Date(Date.now() + CACHE_TTL).toISOString(),
    subtitles:  [],
  })
}

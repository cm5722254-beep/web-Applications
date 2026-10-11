import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// /api/ak-proxy — Server-side proxy for animekill.com API calls
//
// The browser CANNOT call animekill.com directly due to CORS.
// All animekill API requests from the client go here first, then this route
// forwards them server-side (no CORS restriction on server→server fetch).
//
// Usage (from browser):
//   GET /api/ak-proxy?path=/users/fetchHomePageAnimeTv
//   GET /api/ak-proxy?path=/api/data/anime/tales-of-herding-gods
//   POST /api/ak-proxy?path=/users/fetchAnimeUsingGenre   body: JSON
//   GET /api/ak-proxy?path=/users/fetchSchduleWiseAnime
//   GET /api/ak-proxy?path=/users/fetchGenres
// ─────────────────────────────────────────────────────────────────────────────

// Allowlist — only forward to known animekill endpoints (security: prevent SSRF)
const ALLOWED_PATH_PREFIXES = [
  '/users/fetchHomePageAnimeTv',
  '/users/fetchAnimeUsingGenre',
  '/users/fetchAnimeDetails',
  '/users/fetchSchduleWiseAnime',
  '/users/fetchGenres',
  '/api/data/anime/',
  '/api/data/anime-list',
]

const AK_SERVERS = [
  'https://apis.animekill.com',
  'https://staging.animekill.com',
  'https://animekill.com',
]

const PROXY_TTL = 5 * 60 * 1000 // 5 min server-side cache
const proxyCache = new Map<string, { body: unknown; ts: number }>()

function isAllowed(path: string): boolean {
  return ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
}

async function forwardToAK(
  path: string,
  method: string,
  body: string | null,
): Promise<{ ok: boolean; data: unknown; status: number }> {
  for (const base of AK_SERVERS) {
    try {
      const ctrl = new AbortController()
      const t    = setTimeout(() => ctrl.abort(), 5000)

      const res = await fetch(`${base}${path}`, {
        method,
        headers: {
          'Content-Type':  'application/json',
          'Accept':        'application/json',
          'User-Agent':    'Mozilla/5.0 (compatible; SC-ANIME-KH/1.0)',
          'Origin':        'https://animekill.com',
          'Referer':       'https://animekill.com/',
        },
        body: body ?? undefined,
        signal: ctrl.signal,
      })
      clearTimeout(t)

      if (res.ok) {
        const data = await res.json()
        return { ok: true, data, status: res.status }
      }
    } catch { /* try next server */ }
  }
  return { ok: false, data: null, status: 502 }
}

// ── GET /api/ak-proxy?path=... ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') ?? ''

  if (!path) {
    return NextResponse.json({ error: 'Missing path param' }, { status: 400 })
  }
  if (!isAllowed(path)) {
    return NextResponse.json({ error: 'Path not allowed' }, { status: 403 })
  }

  const cacheKey = `GET:${path}`
  const cached   = proxyCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < PROXY_TTL) {
    return NextResponse.json(cached.body, {
      headers: { 'X-Proxy-Cache': 'HIT' },
    })
  }

  const { ok, data, status } = await forwardToAK(path, 'GET', null)
  if (!ok || data === null) {
    return NextResponse.json({ error: 'Upstream error' }, { status })
  }

  proxyCache.set(cacheKey, { body: data, ts: Date.now() })
  return NextResponse.json(data, {
    headers: {
      'X-Proxy-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  })
}

// ── POST /api/ak-proxy?path=... ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') ?? ''

  if (!path) {
    return NextResponse.json({ error: 'Missing path param' }, { status: 400 })
  }
  if (!isAllowed(path)) {
    return NextResponse.json({ error: 'Path not allowed' }, { status: 403 })
  }

  let bodyText: string | null = null
  try {
    bodyText = await req.text()
    // Validate it's JSON (prevent injection)
    if (bodyText) JSON.parse(bodyText)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Cache POST requests by path + body
  const cacheKey = `POST:${path}:${bodyText ?? ''}`
  const cached   = proxyCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < PROXY_TTL) {
    return NextResponse.json(cached.body, {
      headers: { 'X-Proxy-Cache': 'HIT' },
    })
  }

  const { ok, data, status } = await forwardToAK(path, 'POST', bodyText)
  if (!ok || data === null) {
    return NextResponse.json({ error: 'Upstream error' }, { status })
  }

  proxyCache.set(cacheKey, { body: data, ts: Date.now() })
  return NextResponse.json(data, {
    headers: { 'X-Proxy-Cache': 'MISS' },
  })
}

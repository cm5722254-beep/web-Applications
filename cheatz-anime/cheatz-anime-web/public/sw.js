// SC-ANIME KH — Service Worker v3
// ─────────────────────────────────────────────────────────────────────────────
// Rules:
//  1. Only intercept same-origin requests (never cross-origin → no CORS issues)
//  2. Only cache static image/font assets (png, jpg, webp, svg, woff2, ico)
//  3. Never intercept /api/* routes — always network-only
//  4. Never intercept cross-origin fetch (animekill.com, dailymotion.com, etc.)
//  5. Network-first for all HTML/JS/CSS page navigations
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_NAME    = 'sc-anime-cache-v3'
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo.png',
  '/icon.png',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
]

// ── Install: pre-cache only the core static files ────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll is best-effort — ignore missing files
      Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)))
    )
  )
  self.skipWaiting()
})

// ── Activate: delete old cache versions ──────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: fine-grained interception ─────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  // ── Rule 1: ONLY handle same-origin requests ──────────────────────────────
  // Cross-origin (animekill.com, dailymotion.com, etc.) → pass through
  // without any SW involvement. This prevents CORS errors.
  if (url.origin !== self.location.origin) {
    // Do NOT call event.respondWith() — browser handles it natively
    return
  }

  // ── Rule 2: Never intercept API routes — always go to network ────────────
  if (url.pathname.startsWith('/api/')) {
    // Do NOT call event.respondWith() — network only
    return
  }

  // ── Rule 3: Only GET requests ─────────────────────────────────────────────
  if (req.method !== 'GET') return

  // ── Rule 4: Cache static image/font assets (cache-first) ─────────────────
  if (/\.(png|jpe?g|svg|webp|ico|woff2?|gif)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached

        return fetch(req)
          .then((res) => {
            // Only cache successful same-origin responses (opaque responses
            // have status 0 and must not be cached — that was the old bug)
            if (res && res.status === 200 && res.type === 'basic') {
              const clone = res.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone))
            }
            return res
          })
          .catch(() => cached ?? new Response('', { status: 503 }))
      })
    )
    return
  }

  // ── Rule 5: All other same-origin requests → network-first, no caching ───
  // Includes navigation requests, _next/static chunks, etc.
  event.respondWith(
    fetch(req).catch(() =>
      caches.match(req).then(
        (cached) => cached ?? new Response('Offline', { status: 503 })
      )
    )
  )
})

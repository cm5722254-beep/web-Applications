/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // ── Compiler optimisations ─────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ── Experimental ──────────────────────────────────────────────────────
  experimental: {
    // Enable Partial Pre-rendering (Next 15)
    ppr: false,
    // Optimise package imports to reduce JS bundle
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
  },

  // ── Image domains ─────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'animekill.com' },
      { protocol: 'https', hostname: '*.animekill.com' },
      { protocol: 'https', hostname: 'i7.imageban.ru' },
      { protocol: 'https', hostname: 'imageban.ru' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    // Serve unoptimised for external embeds (reduces egress)
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
  },

  // ── Security / performance headers ────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Clickjacking protection
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Reflected-XSS filter (legacy browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy – deny sensors not needed by streaming app
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // CSP – tuned for streaming embeds
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://geo.dailymotion.com https://www.dailymotion.com https://www.googletagmanager.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob: https: http:",
              // ── frame-src: Dailymotion ONLY ──────────────────────────────
              "frame-src 'self' https://geo.dailymotion.com https://www.dailymotion.com",
              "connect-src 'self' https://apis.animekill.com https://staging.animekill.com https://animekill.com https://api.dailymotion.com blob: wss: ws:",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
      // Static assets caching
      {
        source: '/icons/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ]
  },

  // ── Redirects ─────────────────────────────────────────────────────────
  async redirects() {
    return [
      { source: '/donghua', destination: '/anime?type=donghua', permanent: true },
      { source: '/home', destination: '/', permanent: true },
    ]
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // English-only — no locale switching
  // i18n is NOT configured here; the app is 100% English

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
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://geo.dailymotion.com https://www.dailymotion.com https://ok.ru https://rumble.com https://playing.donghuaworld.in https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https:",
              "media-src 'self' blob: https: http:",
              "frame-src 'self' https://geo.dailymotion.com https://www.dailymotion.com https://ok.ru https://rumble.com https://playing.donghuaworld.in https://www.youtube.com https://youtu.be https://skylineai.cloud https://gdriveplayer.to",
              "connect-src 'self' https://apis.animekill.com https://staging.animekill.com https://animekill.com blob: wss: ws:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

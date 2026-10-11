import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt'

// ── Google Fonts — loaded via next/font (zero layout shift) ────────────────
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // Preload the subset used on above-the-fold text
  preload: true,
})

// ── Viewport (exported separately as per Next.js 14+ spec) ─────────────────
export const viewport: Viewport = {
  themeColor: '#07080f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

// ── Site-wide metadata ──────────────────────────────────────────────────────
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const SITE_NAME = 'SC-ANIME KH'
const SITE_TITLE = 'SC-ANIME KH — Watch Chinese Donghua, Japanese Anime & Movies in 4K'
const SITE_DESCRIPTION =
  'The premier streaming catalog for high-definition Chinese Donghua, Japanese Anime, and Movies with fast instant playback in Full HD & 4K.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // ── Title template ────────────────────────────────────────────────────
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  // ── PWA manifest ─────────────────────────────────────────────────────
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: SITE_NAME,
  },

  // ── SEO ───────────────────────────────────────────────────────────────
  keywords: [
    'anime', 'donghua', 'chinese anime', 'streaming', 'sc-anime',
    '4k anime', 'tales of herding gods', 'donghua schedule', 'anime movies',
    'watch anime online', 'free anime streaming', 'manhwa', 'manhua',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1 },
  },

  // ── Icons ─────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [{ rel: 'mask-icon', url: '/logo.png', color: '#00d4ff' }],
  },

  // ── Open Graph ────────────────────────────────────────────────────────
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: '/pwa-icon-512.png',
        width: 512,
        height: 512,
        alt: `${SITE_NAME} Logo`,
      },
    ],
  },

  // ── Twitter card ─────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/pwa-icon-512.png'],
  },

  // ── Verification (add tokens if needed) ───────────────────────────────
  // verification: { google: 'YOUR_GOOGLE_SITE_VERIFICATION_TOKEN' },

  // ── Alternates ────────────────────────────────────────────────────────
  alternates: {
    canonical: SITE_URL,
  },
}

// ── Root layout ─────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to critical CDNs for faster image loading */}
        <link rel="preconnect" href="https://animekill.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://apis.animekill.com" />
        <link rel="dns-prefetch" href="https://staging.animekill.com" />

        {/* PWA / mobile meta */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="msapplication-TileColor" content="#07080f" />

        {/* ── Browser-extension crash suppressor ────────────────────────────
            Catches uncaught errors from chrome/firefox extensions (M_ID, etc.)
            before they crash the React tree. Runs inline before any JS loads. */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var _origOnError = window.onerror;
  window.onerror = function(msg, src, line, col, err) {
    if (src && (src.indexOf('chrome-extension://') !== -1 || src.indexOf('moz-extension://') !== -1)) return true;
    if (typeof msg === 'string' && (msg.indexOf('M_ID') !== -1 || msg.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1)) return true;
    if (_origOnError) return _origOnError.apply(this, arguments);
    return false;
  };
  window.addEventListener('unhandledrejection', function(e) {
    var reason = e.reason;
    if (reason && reason.stack && (reason.stack.indexOf('chrome-extension://') !== -1 || reason.stack.indexOf('moz-extension://') !== -1)) {
      e.preventDefault(); return;
    }
    if (reason && typeof reason.message === 'string' && reason.message.indexOf('M_ID') !== -1) {
      e.preventDefault(); return;
    }
  });
})();
        ` }} />
      </head>
      <body
        className="bg-[#07080f] text-white antialiased selection:bg-cyan-600 selection:text-white"
      >
        <Providers>
          {children}
          <PwaInstallPrompt />
        </Providers>
      </body>
    </html>
  )
}

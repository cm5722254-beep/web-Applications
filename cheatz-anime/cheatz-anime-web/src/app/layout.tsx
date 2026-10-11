import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt'

export const viewport: Viewport = {
  themeColor: '#07080f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'SC-ANIME KH — Watch Chinese Donghua, Japanese Anime & Movies in 4K',
  description:
    'The premier streaming catalog for high-definition Chinese Donghua, Japanese Anime, and Movies with fast instant playback in Full HD & 4K.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SC-ANIME KH',
  },
  keywords: [
    'anime',
    'donghua',
    'chinese anime',
    'streaming',
    'sc-anime',
    '4k anime',
    'tales of herding gods',
    'donghua schedule',
    'anime movies',
  ],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'SC-ANIME KH — Watch Chinese Donghua, Japanese Anime & Movies in 4K',
    description:
      'The premier streaming platform for Chinese Donghua, Japanese Anime, and Movies with high-speed video servers.',
    type: 'website',
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'SC-ANIME KH Logo' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-[#07080f] text-white antialiased selection:bg-cyan-600 selection:text-white">
        <Providers>
          {children}
          <PwaInstallPrompt />
        </Providers>
      </body>
    </html>
  )
}

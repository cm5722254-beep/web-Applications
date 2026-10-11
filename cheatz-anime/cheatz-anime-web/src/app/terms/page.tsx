import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata = { title: 'Terms of Service — SC-ANIME KH' }

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing SC-ANIME KH you agree to these Terms of Service. If you do not agree, do not use the platform.',
  },
  {
    title: '2. Content Disclaimer',
    body: 'SC-ANIME KH does not host any video files on its own servers. All streams are indexed from publicly available third-party video hosting platforms (Dailymotion, OK.ru, DonghuaWorld, etc.). We are not responsible for the content of third-party platforms.',
  },
  {
    title: '3. User Accounts',
    body: 'Accounts are created via Google OAuth. You are responsible for maintaining the security of your account. We reserve the right to suspend accounts that violate these terms.',
  },
  {
    title: '4. VIP Membership',
    body: 'VIP membership is a one-time $1 payment processed through our Telegram admin (@BongCheatz_IT). Payments are non-refundable once VIP access has been activated.',
  },
  {
    title: '5. Prohibited Conduct',
    body: 'You may not use the platform to distribute malware, scrape content for redistribution, or circumvent any access controls. Automated scraping of our catalog is strictly prohibited.',
  },
  {
    title: '6. Intellectual Property',
    body: 'All anime and donghua titles are the intellectual property of their respective owners. SC-ANIME KH makes no claim of ownership over any third-party content indexed on this platform.',
  },
  {
    title: '7. DMCA / Copyright Takedowns',
    body: 'If you are a rights holder and believe content on this platform infringes your copyright, contact us at dmca@sc-anime.kh. We will process valid takedown requests within 48 hours.',
  },
  {
    title: '8. Changes to Terms',
    body: 'We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-14">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Terms of Service</h1>
        <p className="text-neutral-400 text-sm mb-10">Last updated: October 2026</p>

        <div className="space-y-6">
          {SECTIONS.map((s) => (
            <div key={s.title} className="bg-[#0e111f] border border-white/5 rounded-2xl p-6">
              <h2 className="text-white font-bold text-base mb-2">{s.title}</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

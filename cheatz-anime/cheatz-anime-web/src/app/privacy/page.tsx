import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata = { title: 'Privacy Policy — SC-ANIME KH' }

const SECTIONS = [
  {
    title: 'What We Collect',
    body: 'When you sign in with Google, we receive your name, email address, and profile photo from Google OAuth. This information is stored locally in your browser (localStorage). We do not store this data on any remote server.',
  },
  {
    title: 'Watch History & Favorites',
    body: 'Your watch history, progress, and favorites are stored exclusively in your browser\'s localStorage. They are never transmitted to or stored on our servers. Clearing your browser data will delete this information.',
  },
  {
    title: 'Cookies',
    body: 'We use only an authentication token stored in localStorage to keep you signed in. We do not use third-party tracking cookies or advertising cookies.',
  },
  {
    title: 'Third-Party Video Platforms',
    body: 'Video streams are served by third-party platforms (Dailymotion, OK.ru, etc.). These platforms may collect their own data per their respective privacy policies when you view their embedded players.',
  },
  {
    title: 'Analytics',
    body: 'We do not currently run any analytics or tracking scripts. We do not use Google Analytics, Meta Pixel, or any similar tracking services.',
  },
  {
    title: 'Data Security',
    body: 'Since all personal data is stored in your browser, you remain in full control. To delete all data associated with SC-ANIME KH, clear your browser\'s localStorage for this domain.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy. Any changes will be reflected on this page with an updated date. Your continued use of the platform constitutes acceptance.',
  },
  {
    title: 'Contact',
    body: 'For privacy-related enquiries, contact us via Telegram @BongCheatz_IT or email dmca@sc-anime.kh.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-14">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-neutral-400 text-sm mb-10">Last updated: October 2026</p>

        <div className="space-y-5">
          {SECTIONS.map((s) => (
            <div key={s.title} className="bg-[#0d0f1a] border border-white/5 rounded-2xl p-6">
              <h2 className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-2">{s.title}</h2>
              <p className="text-neutral-300 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-brand-text mb-6">Privacy Policy</h1>
        <div className="space-y-6 text-brand-muted text-sm leading-relaxed">
          <p>Last updated: October 2026</p>
          <h2 className="text-lg font-semibold text-brand-text">Data We Collect</h2>
          <p>Name, email address, watch history, subscription data, and payment transaction references (not full card details).</p>
          <h2 className="text-lg font-semibold text-brand-text">How We Use Your Data</h2>
          <p>To provide the streaming service, personalize your experience, process payments, and send service notifications.</p>
          <h2 className="text-lg font-semibold text-brand-text">Data Retention</h2>
          <p>Account data is retained for as long as your account exists. You may request deletion by contacting support.</p>
          <h2 className="text-lg font-semibold text-brand-text">Third Parties</h2>
          <p>We use Razorpay for payment processing. We do not sell your data to third parties.</p>
          <h2 className="text-lg font-semibold text-brand-text">Cookies</h2>
          <p>We use cookies for authentication and preferences only. No advertising tracking cookies are used.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

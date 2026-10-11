import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-brand-text mb-6">Terms of Service</h1>
        <div className="space-y-6 text-brand-muted text-sm leading-relaxed">
          <p>Last updated: October 2026</p>
          <h2 className="text-lg font-semibold text-brand-text">1. Acceptance</h2>
          <p>By using CHEATZ ANIME, you agree to these Terms of Service.</p>
          <h2 className="text-lg font-semibold text-brand-text">2. Account</h2>
          <p>You are responsible for maintaining the security of your account. You must be at least 13 years old to use this service.</p>
          <h2 className="text-lg font-semibold text-brand-text">3. Content</h2>
          <p>All content is licensed for authorized distribution. Unauthorized redistribution is prohibited.</p>
          <h2 className="text-lg font-semibold text-brand-text">4. Subscription</h2>
          <p>Subscriptions are billed monthly or yearly. Cancellations take effect at the end of the billing period.</p>
          <h2 className="text-lg font-semibold text-brand-text">5. Termination</h2>
          <p>We reserve the right to terminate accounts that violate these terms.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

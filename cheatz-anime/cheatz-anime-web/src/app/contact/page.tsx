import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-brand-text mb-6">Contact Us</h1>
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8">
          <p className="text-brand-muted mb-6 font-khmer">
            មានសំណួរ ឬ ត្រូវការជំនួយ? ទំនាក់ទំនងយើងខ្ញុំ។
          </p>
          <div className="space-y-4 text-brand-muted text-sm">
            <p>📧 <a href="mailto:support@cheatz.anime" className="text-brand-violet hover:text-brand-glow">support@cheatz.anime</a></p>
            <p>📋 For content licensing inquiries: <a href="mailto:licensing@cheatz.anime" className="text-brand-violet hover:text-brand-glow">licensing@cheatz.anime</a></p>
            <p>🔒 For security issues, please see our <a href="/security" className="text-brand-violet hover:text-brand-glow">Security Policy</a>.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

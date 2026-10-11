import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold bg-gradient-to-r from-brand-violet to-brand-glow bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">Page Not Found</h1>
        <p className="text-brand-muted mb-8 font-khmer">ទំព័រដែលអ្នកកំពុងស្វែងរកមិនអាចរកឃើញ</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-violet hover:bg-brand-purple text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

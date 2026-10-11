import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-brand-text mb-6">About CHEATZ ANIME</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-brand-muted">
          <p>
            CHEATZ ANIME is a streaming platform dedicated to bringing anime and donghua to
            Khmer-speaking audiences with high-quality Khmer subtitles.
          </p>
          <p>
            We believe that language should not be a barrier to enjoying the best animated content
            from Japan and China. Our team of dedicated subtitle editors works to provide accurate,
            culturally appropriate Khmer translations for every episode.
          </p>
          <p className="font-khmer">
            CHEATZ ANIME គឺជាប្លែតហ្វមស្ត្រីមីង ដែលឧទ្ទិតដល់ការនាំយកអ្នីម៉េ និង ដុងហ្វ័រ
            មកដល់អ្នកមើលដែលនិយាយភាសាខ្មែរ ជាមួយនឹងប្រអប់ស ភាសាខ្មែរ ដែលមានគុណភាពខ្ពស់។
          </p>
          <p>
            <strong className="text-brand-text">Content Licensing:</strong> All content on CHEATZ ANIME is
            either licensed from authorized providers or created by our team. We do not distribute
            copyrighted content without proper licensing agreements.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

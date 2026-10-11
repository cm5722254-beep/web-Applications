import { redirect } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export default function DirectSlugPage({ params }: Props) {
  const { slug } = params

  // Check if it's an episode slug like tales-of-herding-gods-episode-103
  const epMatch = slug.match(/^(.+)-episode-(\d+)$/i)
  if (epMatch) {
    const animeSlug = epMatch[1]
    const epNum = epMatch[2]
    redirect(`/anime/${animeSlug}/season-1/ep-${epNum}`)
  }

  // Otherwise treat as direct anime slug
  redirect(`/anime/${slug}`)
}

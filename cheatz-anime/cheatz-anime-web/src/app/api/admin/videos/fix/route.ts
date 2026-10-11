import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api'
import { findAlternativeSource } from '@/services/videoSourceFinder'
import { videoHealthStore } from '@/services/videoHealthService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { episodeId, animeSlug, episodeNumber } = body

    if (!episodeId || !animeSlug || episodeNumber === undefined) {
      return NextResponse.json(
        { fixed: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find alternative source
    const foundUrl = await findAlternativeSource(animeSlug, episodeNumber)

    if (!foundUrl) {
      return NextResponse.json(
        { fixed: false, message: 'No working source found' },
        { status: 404 }
      )
    }

    // Update episode in backend
    try {
      await apiClient.put(`/admin/episodes/${episodeId}`, {
        playback_url: foundUrl,
      })

      // Update store
      const entry = videoHealthStore.get(episodeId)
      if (entry) {
        entry.status = 'fixed'
        entry.fixedUrl = foundUrl
        entry.currentUrl = foundUrl
        entry.errorDetail = null
        entry.checkedAt = new Date().toISOString()
        videoHealthStore.set(episodeId, entry)
      }

      return NextResponse.json({ fixed: true, url: foundUrl })
    } catch (err) {
      console.error('Failed to update episode:', err)
      return NextResponse.json(
        { fixed: false, message: 'Found source but failed to update database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Failed to fix video:', error)
    return NextResponse.json(
      { fixed: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

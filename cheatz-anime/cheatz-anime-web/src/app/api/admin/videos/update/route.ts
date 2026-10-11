import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api'
import { checkVideoUrl, videoHealthStore } from '@/services/videoHealthService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { episodeId, newUrl } = body

    if (!episodeId || !newUrl || newUrl.trim() === '') {
      return NextResponse.json(
        { updated: false, error: 'Episode ID and URL are required' },
        { status: 400 }
      )
    }

    // Validate URL is accessible
    const urlCheck = await checkVideoUrl(newUrl)
    
    if (!urlCheck.ok) {
      return NextResponse.json(
        { updated: false, error: 'URL is not accessible' },
        { status: 422 }
      )
    }

    // Update episode in backend
    try {
      await apiClient.put(`/admin/episodes/${episodeId}`, {
        playback_url: newUrl,
      })

      // Update store
      const entry = videoHealthStore.get(episodeId)
      if (entry) {
        entry.currentUrl = newUrl
        entry.status = 'working'
        entry.errorDetail = null
        entry.checkedAt = new Date().toISOString()
        videoHealthStore.set(episodeId, entry)
      }

      return NextResponse.json({ updated: true })
    } catch (err) {
      console.error('Failed to update episode:', err)
      return NextResponse.json(
        { updated: false, error: 'Failed to update database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Failed to update video URL:', error)
    return NextResponse.json(
      { updated: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

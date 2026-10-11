import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api'
import { findAlternativeSource } from '@/services/videoSourceFinder'
import { updateEntry } from '@/services/videoHealthService'

// ── Auth Helper ──────────────────────────────────────────────────────────────
function getAuthHeader(request: NextRequest): string | null {
  return request.headers.get('Authorization')
}

function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized - Admin access required' },
    { status: 401 }
  )
}

export async function POST(request: NextRequest) {
  const authHeader = getAuthHeader(request)
  if (!authHeader) {
    return unauthorizedResponse()
  }

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

    // Update episode in backend with auth header
    try {
      await apiClient.put(`/admin/episodes/${episodeId}`, 
        { playback_url: foundUrl },
        { headers: { Authorization: authHeader } }
      )

      // Update store
      updateEntry(episodeId, {
        status: 'fixed',
        fixedUrl: foundUrl,
        currentUrl: foundUrl,
        errorDetail: null,
        checkedAt: new Date().toISOString(),
      })

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

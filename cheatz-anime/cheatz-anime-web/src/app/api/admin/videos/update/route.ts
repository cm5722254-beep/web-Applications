import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api'
import { checkVideoUrl, updateEntry } from '@/services/videoHealthService'

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

    // Update episode in backend with auth header
    try {
      await apiClient.put(`/admin/episodes/${episodeId}`, 
        { playback_url: newUrl },
        { headers: { Authorization: authHeader } }
      )

      // Update store
      updateEntry(episodeId, {
        currentUrl: newUrl,
        status: 'working',
        errorDetail: null,
        checkedAt: new Date().toISOString(),
      })

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

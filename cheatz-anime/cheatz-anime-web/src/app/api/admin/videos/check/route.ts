import { NextRequest, NextResponse } from 'next/server'
import { checkVideoUrl } from '@/services/videoHealthService'

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
    const { episodeId, url } = body

    if (!url) {
      return NextResponse.json(
        { ok: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    const result = await checkVideoUrl(url)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to check video URL:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to check URL' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getHealthStats, getAllEntries } from '@/services/videoHealthService'

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

export async function GET(request: NextRequest) {
  const authHeader = getAuthHeader(request)
  if (!authHeader) {
    return unauthorizedResponse()
  }

  try {
    const stats = getHealthStats()
    const entries = getAllEntries()

    return NextResponse.json({
      ...stats,
      entries,
    })
  } catch (error) {
    console.error('Failed to get health status:', error)
    return NextResponse.json(
      { error: 'Failed to get health status' },
      { status: 500 }
    )
  }
}

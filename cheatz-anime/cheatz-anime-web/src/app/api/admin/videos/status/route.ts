import { NextRequest, NextResponse } from 'next/server'
import { getHealthStats, getAllEntries } from '@/services/videoHealthService'

export async function GET(request: NextRequest) {
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

import { NextRequest, NextResponse } from 'next/server'
import { scanAllEpisodes, getHealthStats, getAllEntries } from '@/services/videoHealthService'

export async function POST(request: NextRequest) {
  try {
    // Fire and forget — start scan in background
    scanAllEpisodes().catch(err => {
      console.error('Background scan failed:', err)
    })

    return NextResponse.json({ started: true })
  } catch (error) {
    console.error('Failed to start scan:', error)
    return NextResponse.json(
      { error: 'Failed to start scan' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = getHealthStats()
    const entries = getAllEntries()

    return NextResponse.json({
      ...stats,
      entries,
    })
  } catch (error) {
    console.error('Failed to get health stats:', error)
    return NextResponse.json(
      { error: 'Failed to get health stats' },
      { status: 500 }
    )
  }
}

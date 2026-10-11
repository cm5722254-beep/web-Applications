import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Sync route to fetch fresh anime listings and updates from AnimeKill
export async function GET(req: NextRequest) {
  try {
    const res = await fetch('https://animekill.com/api/data/anime-list?limit=60&page=1', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch upstream anime list' },
        { status: 502 }
      )
    }

    const json = await res.json()
    const latestItems = json?.data?.data || []

    return NextResponse.json({
      success: true,
      synced_at: new Date().toISOString(),
      count: latestItems.length,
      sample_latest: latestItems.slice(0, 5).map((item: any) => ({
        name: item.name,
        type: item.anime_type,
        origin: item.anime_origin,
        latest_ep: item.next_episode_trailer_number || item.total_watch,
        last_update: item.last_update,
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

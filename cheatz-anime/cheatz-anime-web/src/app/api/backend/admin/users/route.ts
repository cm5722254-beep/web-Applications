import { NextRequest, NextResponse } from 'next/server'
import { getPaginatedUsers } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      per_page: parseInt(searchParams.get('per_page') || '20'),
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      role: searchParams.get('role') || undefined,
      subscribed: searchParams.get('subscribed') === 'true' ? true : 
                   searchParams.get('subscribed') === 'false' ? false : undefined,
    }

    const result = getPaginatedUsers(params)

    return NextResponse.json({
      data: result.users,
      meta: result.meta,
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

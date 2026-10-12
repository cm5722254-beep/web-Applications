import { NextRequest, NextResponse } from 'next/server'
import { upsertUser } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, avatar, google_id } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const isSuperAdmin = email.toLowerCase() === 'socheatvireakchan@gmail.com'

    const user = upsertUser({
      email: email.toLowerCase(),
      name: name || 'Unknown User',
      avatar: avatar || null,
      google_id,
      roles: isSuperAdmin ? ['super_admin', 'admin', 'user'] : ['user'],
      subscribed: true, // All Google users get VIP for now
      subscription_plan: 'Google OAuth VIP',
      login_provider: 'google',
    })

    // Generate simple token (in production, use JWT)
    const token = `token_${user.id}_${Date.now()}`

    return NextResponse.json({
      user,
      token,
      access_token: token,
    })
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

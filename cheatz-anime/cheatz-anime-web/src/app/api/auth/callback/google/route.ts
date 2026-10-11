import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state') || '/'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error || 'auth_failed')}`)
  }

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    ''
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET ||
    ''
  const redirectUri = `${appUrl}/api/auth/callback/google`

  try {
    // 1. Exchange code for Google access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('Google token exchange error:', errBody)
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`)
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    // 2. Fetch verified Google user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(`${appUrl}/login?error=fetch_userinfo_failed`)
    }

    const googleUser = await userRes.json()
    const email = (googleUser.email || '').toLowerCase().trim()
    const name = googleUser.name || email.split('@')[0]
    const avatar = googleUser.picture || null

    const isSuperAdmin = email === 'socheatvinchan@gmail.com'

    const sessionUser = {
      id: isSuperAdmin ? 1 : Math.floor(Math.random() * 900000) + 100000,
      name: isSuperAdmin ? 'Socheat Vinchan (Super Admin)' : name,
      email,
      avatar,
      status: 'active',
      preferred_language: 'en',
      preferred_subtitle_language: 'en',
      ads_enabled: false,
      roles: isSuperAdmin ? ['super_admin', 'admin'] : ['user'],
      subscribed: true, // VIP access enabled
      email_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    const authToken = 'google_token_' + Date.now() + '_' + Math.random().toString(36).substring(2)

    // Render client sync page that stores in localStorage and redirects
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authenticating with Google...</title>
  <style>
    body {
      background: #0d0f18;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .spinner {
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #f59e0b;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <div class="spinner" style="margin: 0 auto 16px;"></div>
    <h2>Connecting Google Account...</h2>
    <p style="color: #94a3b8; font-size: 14px;">Welcome back, ${escapeHtml(name)}</p>
  </div>
  <script>
    try {
      // 1. Save auth session
      localStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(sessionUser))});
      localStorage.setItem('auth_token', ${JSON.stringify(authToken)});

      // 2. Auto-register into admin user DB (sc_anime_managed_users)
      var USERS_KEY = 'sc_anime_managed_users';
      var newUser = ${JSON.stringify(JSON.stringify({
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        avatar: sessionUser.avatar,
        roles: sessionUser.roles,
        subscribed: sessionUser.subscribed,
        subscription_plan: sessionUser.subscribed ? 'Google OAuth' : null,
        subscription_expires_at: null,
        status: 'active',
        created_at: new Date().toISOString(),
        login_provider: 'google',
        last_login_at: new Date().toISOString(),
      }))};
      try {
        var usersRaw = localStorage.getItem(USERS_KEY);
        var users = usersRaw ? JSON.parse(usersRaw) : [];
        var existingIndex = users.findIndex(function(u) {
          return u.email.toLowerCase() === ${JSON.stringify(email)};
        });
        var parsedNewUser = JSON.parse(newUser);
        if (existingIndex === -1) {
          // New user — add to list
          users.push(parsedNewUser);
        } else {
          // Existing user — update login info but preserve roles/VIP set by admin
          users[existingIndex] = Object.assign({}, users[existingIndex], {
            name: parsedNewUser.name,
            avatar: parsedNewUser.avatar,
            last_login_at: parsedNewUser.last_login_at,
            login_provider: 'google',
            status: users[existingIndex].status || 'active',
          });
        }
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      } catch (dbErr) {
        console.warn('Admin DB registration failed:', dbErr);
      }

      // 3. Notify auth listeners
      window.dispatchEvent(new Event('auth_updated'));
    } catch (e) {
      console.error(e);
    }
    window.location.replace(${JSON.stringify(state || '/')});
  </script>
</body>
</html>`

    const response = new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })

    // Also set session cookie for server components
    response.cookies.set('auth_token', authToken, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    })

    return response
  } catch (err) {
    console.error('Google OAuth callback handler exception:', err)
    return NextResponse.redirect(`${appUrl}/login?error=server_error`)
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

# Deploy Laravel Backend API

Your Laravel backend is in: `cheatz-anime/cheatz-anime-api`

## Option 1: Railway.app (Recommended - FREE)

1. Go to: https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose: `cm5722254-beep/web-Applications`
6. Set root directory: `cheatz-anime/cheatz-anime-api`
7. Railway will auto-detect Laravel
8. Add environment variables:
   - `APP_KEY` (generate with `php artisan key:generate`)
   - `DB_CONNECTION=mysql`
   - `DB_HOST` (Railway provides)
   - `DB_DATABASE` (Railway provides)
   - `DB_USERNAME` (Railway provides)
   - `DB_PASSWORD` (Railway provides)
9. Deploy!

Railway will give you a URL like: `https://your-app.railway.app`

## Option 2: Render.com (FREE)

1. Go to: https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub: `web-Applications`
4. Settings:
   - **Name**: `cheatz-anime-api`
   - **Root Directory**: `cheatz-anime/cheatz-anime-api`
   - **Environment**: `PHP`
   - **Build Command**: `composer install --no-dev && php artisan config:cache && php artisan route:cache`
   - **Start Command**: `php artisan serve --host=0.0.0.0 --port=$PORT`
5. Add environment variables (same as above)
6. Create PostgreSQL database (Free tier)
7. Deploy!

## Option 3: DigitalOcean App Platform ($5/month)

1. Go to: https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repo
4. Select `cheatz-anime/cheatz-anime-api`
5. Choose: **PHP** runtime
6. Add managed database (MySQL)
7. Deploy!

## After Deployment

Update your frontend `.env.production`:

```
NEXT_PUBLIC_API_BASE_URL=https://your-new-backend-url.com/api/v1
```

Then redeploy frontend on Vercel!

## Current Status

- ❌ Backend NOT deployed yet
- ✅ Frontend deployed: https://web-applications-murex.vercel.app
- 🔄 Using localStorage fallback for user management

Backend URL should be: `https://apis.animekill.com`
(Currently showing 404 - needs deployment)

# Windows 10/11 Setup Guide — CHEATZ ANIME

**OS:** Windows 10 / Windows 11  
**Shell:** PowerShell 5.1+ or PowerShell 7+

---

## Prerequisites Installation

### 1. Install PHP 8.2+

**Option A: Using Laragon (recommended for Windows)**
Download from https://laragon.org — includes PHP, Composer, and a web server.

**Option B: Using XAMPP**
Download PHP 8.2 from https://windows.php.net/download/

**Option C: Scoop (package manager)**
```powershell
# Install Scoop
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Install PHP
scoop install php
```

**Verify:**
```powershell
php --version
# Expected: PHP 8.2.x or higher
```

### 2. Install Composer

Download from https://getcomposer.org/Composer-Setup.exe

```powershell
composer --version
# Expected: Composer version 2.x.x
```

### 3. Install Node.js 20+

Download from https://nodejs.org (LTS version)

```powershell
node --version   # Expected: v20.x.x or higher
npm --version    # Expected: 10.x.x or higher
```

### 4. Install Docker Desktop

Download from https://www.docker.com/products/docker-desktop/

- Enable WSL 2 backend when prompted
- Start Docker Desktop and wait for it to show "Engine running"

```powershell
docker --version
docker-compose --version
```

---

## Project Setup Steps

### Step 1: Navigate to project directory

```powershell
cd C:\Users\NIN\Documents\Anime\cheatz-anime
```

### Step 2: Start database and cache

```powershell
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait ~30 seconds, then verify
docker-compose ps

# Expected: both services show "healthy" or "running"
```

### Step 3: Setup Laravel Backend

```powershell
cd cheatz-anime-api

# Create .env from example
Copy-Item .env.example .env

# Open .env and set the following:
notepad .env
```

**Required .env settings:**
```env
APP_KEY=                        # Will be generated below
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=cheatz_anime
DB_USERNAME=cheatz
DB_PASSWORD=secret              # Must match docker-compose.yml POSTGRES_PASSWORD

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

FRONTEND_URL=http://localhost:3000

# Set before running db:seed
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecureAdminPassword123!
```

```powershell
# Install PHP dependencies
composer install

# Generate application key
php artisan key:generate

# Verify database connectivity
php artisan db:show

# Run migrations
php artisan migrate

# Seed the database (roles, genres, subscription plans, admin user)
php artisan db:seed

# Start development server
php artisan serve --host=127.0.0.1 --port=8000
```

### Step 4: Setup Next.js Frontend (new PowerShell window)

```powershell
cd C:\Users\NIN\Documents\Anime\cheatz-anime\cheatz-anime-web

# Create environment file
Copy-Item .env.example .env.local

# Edit .env.local
notepad .env.local
```

**Required .env.local settings:**
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=   # Leave blank until Razorpay configured
```

```powershell
# Install dependencies
npm install

# Start development server
npm run dev
```

### Step 5: Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Public website |
| http://localhost:3000/admin | Admin dashboard |
| http://127.0.0.1:8000/api/v1 | Laravel API |
| http://127.0.0.1:8000/api/health | Health check |

### Step 6: First Admin Login

1. Go to http://localhost:3000/login
2. Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set in `.env`
3. Navigate to Admin dashboard
4. **Change the admin password immediately**

---

## Running Tests

### Backend Tests

```powershell
cd C:\Users\NIN\Documents\Anime\cheatz-anime\cheatz-anime-api

# Run all tests
php artisan test

# Run with coverage (requires Xdebug)
php artisan test --coverage

# Run specific test file
php artisan test tests/Feature/AuthTest.php
```

### Frontend Checks

```powershell
cd C:\Users\NIN\Documents\Anime\cheatz-anime\cheatz-anime-web

# Lint
npm run lint

# Type check
npm run type-check

# Production build
npm run build
```

---

## Common Windows Errors

### Error: PHP extension pdo_pgsql not found

Edit your `php.ini` (find location with `php --ini`):
```ini
; Uncomment these lines:
extension=pdo_pgsql
extension=pgsql
extension=redis
extension=zip
```

### Error: CORS policy — Access blocked

Check `FRONTEND_URL` in `cheatz-anime-api/.env`:
```env
FRONTEND_URL=http://localhost:3000
```

Then clear config cache:
```powershell
php artisan config:clear
php artisan cache:clear
```

### Error: Docker port 5432 already in use

PostgreSQL is running on your machine. Stop it:
```powershell
# Find the process
netstat -ano | findstr :5432

# Stop local PostgreSQL service
Stop-Service postgresql-x64-16  # or your version
```

### Error: composer install fails — SSL certificate

```powershell
composer config -g disable-tls true   # Temporary fix only
# Or update CA certificates
```

### Error: npm install ENOENT on Windows

```powershell
# Run as Administrator
npm install --legacy-peer-deps
# Or clear cache
npm cache clean --force
npm install
```

### Error: php artisan migrate — connection refused

```powershell
# Check Docker containers
docker-compose ps
docker-compose logs postgres

# Restart if needed
docker-compose restart postgres

# Wait for healthy status
Start-Sleep -Seconds 15
php artisan migrate
```

### Error: Laravel APP_KEY not set

```powershell
php artisan key:generate
```

### Error: Queue worker not running (background jobs not processing)

```powershell
# Start queue worker in new terminal
cd cheatz-anime-api
php artisan queue:work redis --tries=3
```

---

## Full Docker Compose Setup (Alternative)

If you want to run everything in Docker:

```powershell
# Copy .env files first
Copy-Item cheatz-anime-api\.env.example cheatz-anime-api\.env
Copy-Item cheatz-anime-web\.env.example cheatz-anime-web\.env.local

# Edit both .env files
notepad cheatz-anime-api\.env

# Build and start all services
docker-compose up --build

# In another terminal, run migrations
docker exec cheatz_api php artisan migrate --seed
```

---

## Razorpay Testing Setup

1. Create account at https://razorpay.com (use Test mode)
2. Get Test API Keys from Dashboard → Settings → API Keys
3. Add to `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
   ```
4. Setup webhook:
   - Use `ngrok` to expose local server: `ngrok http 8000`
   - Add webhook URL in Razorpay Dashboard: `https://xxxx.ngrok.io/api/v1/webhooks/razorpay`
   - Copy the webhook secret to `RAZORPAY_WEBHOOK_SECRET`
5. Add to Next.js `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   ```

---

## Production Deployment Notes

See [`docs/SECURITY.md`](docs/SECURITY.md) for the full production checklist.

Key differences from local setup:
- `APP_ENV=production`, `APP_DEBUG=false`
- HTTPS required
- `SESSION_SECURE_COOKIE=true`
- Use managed PostgreSQL (not Docker in production)
- Use managed Redis (Upstash, ElastiCache)
- Run `php artisan config:cache && php artisan route:cache && php artisan view:cache`
- Build Next.js: `npm run build && npm start`
- Use a process manager (Supervisor, systemd) for queue workers

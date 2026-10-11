# CHEATZ ANIME 🎌

**ប្លែតហ្វម ស្ត្រីមីង អ្នីម៉េ និង ដុងហ្វ័រ ជាភាសាខ្មែរ**

---

## 📋 លក្ខណៈ Features

- 🎬 **ស្ត្រីមីង** — មើលអ្នីម៉េ និង ដុងហ្វ័រ ជាមួយ HLS streaming
- 📝 **ប្រអប់ស ខ្មែរ** — ប្រអប់ស WebVTT/SRT ភាសាខ្មែរ
- 🔐 **ការចូល/ចុះឈ្មោះ** — Sanctum token authentication
- 👑 **ប្រព័ន្ធ Premium** — ជាវ $1/ខែ ជាមួយ Razorpay
- 🛡️ **RBAC** — super_admin, content_manager, subtitle_editor, support_agent, user
- 📱 **Responsive** — ផ្ទាំងទំហំគ្រប់ប្រភេទ
- 🌐 **ពហុភាសា** — ខ្មែរ + English

## 🛠️ បច្ចេកវិទ្យា Tech Stack

| Component | Technology |
|-----------|------------|
| Backend API | Laravel 12, PHP 8.2 |
| Frontend | Next.js 14, TypeScript |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7 |
| Auth | Laravel Sanctum |
| Permissions | Spatie Laravel Permission |
| Payment | Razorpay |
| Styling | Tailwind CSS |
| Container | Docker Desktop |

## 🚀 ការដំឡើង Windows Setup

### តម្រូវការ Prerequisites

```powershell
# ត្រួតពិនិត្យ PHP
php --version  # ត្រូវការ PHP 8.2+

# ត្រួតពិនិត្យ Composer
composer --version

# ត្រួតពិនិត្យ Node.js
node --version  # ត្រូវការ Node 20+

# ត្រួតពិនិត្យ Docker Desktop
docker --version
```

### ជំហានទី ១: Clone/Setup Project

```powershell
cd C:\Users\NIN\Documents\Anime\cheatz-anime
```

### ជំហានទី ២: Start PostgreSQL & Redis (Docker)

```powershell
docker-compose up -d postgres redis
docker-compose ps  # ត្រួតពិនិត្យថាដំណើរការ
```

### ជំហានទី ៣: Setup Laravel Backend

```powershell
cd cheatz-anime-api

# Copy environment file
copy .env.example .env

# Edit .env — ដំឡើង DB, Redis, Admin credentials
notepad .env

# Install dependencies
composer install

# Generate app key
php artisan key:generate

# Create database & run migrations
php artisan migrate

# Seed roles, genres, subscription plans
# (Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first!)
php artisan db:seed

# Start Laravel server
php artisan serve --port=8000
```

### ជំហានទី ៤: Setup Next.js Frontend

```powershell
# Open new PowerShell window
cd C:\Users\NIN\Documents\Anime\cheatz-anime\cheatz-anime-web

# Copy environment file
copy .env.example .env.local

# Edit .env.local
notepad .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

### ជំហានទី ៥: Open in Browser

- Frontend: http://localhost:3000
- API: http://127.0.0.1:8000/api/v1
- Admin: http://localhost:3000/admin (ចូលដោយប្រើ admin credentials)

---

## 🔧 Environment Variables សំខាន់

### Backend (cheatz-anime-api/.env)

```env
APP_KEY=              # php artisan key:generate
DB_HOST=127.0.0.1
DB_DATABASE=cheatz_anime
DB_USERNAME=cheatz
DB_PASSWORD=          # ពាក្យសម្ងាត់ PostgreSQL

REDIS_HOST=127.0.0.1

FRONTEND_URL=http://localhost:3000

# Admin account (run ONCE before db:seed)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=       # ពាក្យសម្ងាត់ Administrator

# Razorpay (optional, for payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

### Frontend (cheatz-anime-web/.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=   # key_id ប៉ុណ្ណោះ (public)
```

---

## 🧪 ការ Test

```powershell
# Backend tests (requires PostgreSQL)
cd cheatz-anime-api
php artisan test

# Frontend lint
cd ..\cheatz-anime-web
npm run lint

# Frontend type check
npm run type-check

# Frontend build
npm run build
```

---

## 📁 រចនាសម្ព័ន្ធ Project Structure

```
cheatz-anime/
├── cheatz-anime-api/          # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/  # Auth, V1 (public), Admin, Payment
│   │   ├── Models/            # 11 Eloquent models
│   │   ├── Policies/          # Authorization policies
│   │   ├── Services/          # Business logic
│   │   └── Http/Resources/    # API response formatting
│   ├── database/
│   │   ├── migrations/        # 15 migrations
│   │   ├── seeders/           # Roles, genres, plans, admin
│   │   └── factories/         # Test data factories
│   └── tests/Feature/         # Auth, Anime, Webhook tests
├── cheatz-anime-web/          # Next.js 14 Frontend
│   └── src/
│       ├── app/               # App Router pages
│       ├── components/        # Navbar, Footer, AnimeCard, UI
│       ├── hooks/             # useAuth
│       ├── i18n/              # Khmer + English translations
│       ├── services/          # API service functions
│       └── types/             # TypeScript types
├── docs/
│   ├── API.md
│   ├── SECURITY.md
│   ├── IMPLEMENTATION_AUDIT.md
│   └── IMPLEMENTATION_STATUS.md
└── docker-compose.yml
```

---

## 🐛 ការដោះស្រាយបញ្ហា Troubleshooting

### PostgreSQL connection refused
```powershell
docker-compose up -d postgres
docker-compose logs postgres
```

### CORS error from frontend
- ត្រួតពិនិត្យ `FRONTEND_URL` ក្នុង `.env`
- ត្រួតពិនិត្យ `NEXT_PUBLIC_API_BASE_URL` ក្នុង `.env.local`

### Migrations fail
```powershell
# ត្រួតពិនិត្យ DB connection
php artisan db:show

# Run migrations fresh (WARNING: deletes all data)
php artisan migrate:fresh --seed
```

### npm install fails on Windows
```powershell
# Run as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install --legacy-peer-deps
```

---

## 📄 ឯកសារ Documentation

- [API Reference](docs/API.md)
- [Security Policy](docs/SECURITY.md)
- [Implementation Audit](docs/IMPLEMENTATION_AUDIT.md)
- [Implementation Status](docs/IMPLEMENTATION_STATUS.md)

---

## ⚠️ ការកំណត់ Content Licensing

**ខ្លឹមសារ (content) ទាំងអស់ ត្រូវតែមានការអនុញ្ញាតពីម្ចាស់ copyright។**

CHEATZ ANIME មិនអនុញ្ញាតឱ្យចែកចាយ content ដែលគ្មានការអនុញ្ញាត។  
Content provider ត្រូវការ configuration ដាច់ដោយឡែក។

---

© 2026 CHEATZ ANIME — Built with Laravel 12 + Next.js 14

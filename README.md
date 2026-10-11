# SC-ANIME KH 🎌 — Web Applications

Ultra-fast streaming platform for Chinese Donghua, Japanese Anime, and Movies in Full HD and 4K Ultra HD.

![SC-ANIME KH](cheatz-anime/cheatz-anime-web/public/logo.png)

---

## ⚡ Highlights & Features

- 🎬 **Instant Playback Streaming**: Zero-buffering streaming pipeline with Next.js RSC stream resolution, DailyMotion embed, OK.ru, Rumble, and HLS support.
- 🔐 **Real Google Authentication**: 1-click Google OAuth 2.0 verification using Google Cloud Console credentials. Syncs watch history and favorites across devices.
- 📅 **Weekly Release Schedule**: Live broadcast calendar categorized from Monday to Sunday matching the official Donghua release timetable.
- 🏷️ **Comprehensive Category & Genre Classification**: Full catalog categorization derived from APK analysis (Cultivation, Martial Arts, Monster Evolution, Rebirth, Overpowered MC, etc.).
- 🛡️ **Copyright & DMCA Disclaimer**: Built-in intellectual property protection in application settings and footers.
- 🌐 **100% English User Experience**: Clean, modern English localization across all interfaces, players, menus, and controls.
- 💎 **Cyber Neon Aesthetics**: Dark mode `#07080f` palette with electric cyan, sky blue, and golden accents matching the official SC-ANIME KH identity.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **State & Cache** | TanStack Query v5, In-memory stream caching |
| **Authentication** | Google OAuth 2.0 / Next.js Server Route Handler |
| **Video Engine** | Next.js RSC resolver, HLS.js, Custom embed iframe renderer |
| **Backend API** | Laravel 12 / PHP 8.2 / Sanctum |
| **Database** | PostgreSQL 16, Redis 7 |

---

## 🚀 Quick Setup & Run Locally

### 1. Frontend (Next.js)

```bash
cd cheatz-anime/cheatz-anime-web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_BASE_URL=https://apis.animekill.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📜 Intellectual Property & Copyright Notice

All anime titles, cover posters, character names, and video contents displayed on this platform are property of their respective creators and animation studios (e.g., Tencent Penguin Pictures, Bilibili, Youku, iQIYI, Sparkly Key Animation). This application acts exclusively as an index and streaming player interface and does not host media files on its servers.

---

## 📄 License

MIT License. Designed and developed for SC-ANIME KH.

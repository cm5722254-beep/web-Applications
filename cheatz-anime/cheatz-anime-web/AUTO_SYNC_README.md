# 🔄 SC-ANIME Auto-Sync System

## ទាញយកទិន្នន័យថ្មី (Manual Sync)

ដើម្បីទាញយកអនីមេថ្មីពី AnimeKill ដោយដៃ:

```bash
npm run sync
```

នឹងទាញយក **1483+ anime** ទាំងអស់ពី AnimeKill API

---

## Auto-Sync រៀងរាល់ម៉ោង (Automatic Hourly Sync)

ដើម្បីរត់ auto-sync service ដែលធ្វើ sync រៀងរាល់ 1 ម៉ោង:

```bash
npm run sync:auto
```

**Service នឹង:**
- ✅ Sync ភ្លាមៗពេលចាប់ផ្តើម
- ⏰ Sync ម្តងទៀតរៀងរាល់ 1 ម៉ោង
- 📊 បង្ហាញ log នៃ sync ម្តងៗ
- 🔄 រត់បន្តរហូតទាល់តែអ្នកបញ្ឈប់វា (Ctrl+C)

---

## ការប្រើប្រាស់ Production

### Windows (PowerShell)

**Run in background:**
```powershell
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run","sync:auto"
```

**Stop:**
```powershell
Get-Process -Name node | Where-Object {$_.MainWindowTitle -like "*sync*"} | Stop-Process
```

### Linux/Mac

**Run in background:**
```bash
nohup npm run sync:auto > sync.log 2>&1 &
```

**Stop:**
```bash
pkill -f "auto_sync.js"
```

### Docker (Recommended)

Add to your `docker-compose.yml`:

```yaml
services:
  anime-sync:
    build: ./cheatz-anime-web
    command: npm run sync:auto
    restart: unless-stopped
    volumes:
      - ./cheatz-anime-web/src/data:/app/src/data
```

---

## កំណត់ពេលវេលា Sync

ប្រសិនបើចង់ផ្លាស់ប្តូរពីម៉ោង (hour) ទៅពេលផ្សេង, កែ `scripts/auto_sync.js`:

```javascript
// 30 minutes = 1800000
// 1 hour = 3600000  ← បច្ចុប្បន្ន
// 2 hours = 7200000
setInterval(runSync, 3600000);
```

---

## Logs & Monitoring

Auto-sync service នឹងបង្ហាញ:
- 🚀 ពេលចាប់ផ្តើម sync
- ✅ ពេល sync ជោគជ័យ
- ❌ ពេលមាន error
- ⏰ ពេលវេលានៃ sync បន្ទាប់

Example output:
```
🔄 SC-ANIME Auto-Sync Service Started
📡 Will sync anime catalog every 1 hour
-------------------------------------------

[10/11/2026, 4:30:53 PM] 🚀 Starting sync #1...
=== Starting Full Import of all 1,483 Anime from AnimeKill ===
Total anime: 1483, Total pages to fetch: 15
Fetched through page 15 / 15 (Total loaded: 1483)
✅ Sync #1 completed successfully!
Next sync in 1 hour (at 5:30:53 PM)...
```

---

## ចំណាំសំខាន់

1. **Real-time updates**: ពេល catalog ត្រូវបាន sync, Next.js dev server នឹង hot-reload ដោយស្វ័យប្រវត្តិ
2. **Production**: ត្រូវ rebuild website បន្ទាប់ពី sync: `npm run build`
3. **API Rate Limits**: Script fetch 3 pages ក្នុងមួយពេល - កុំ run sync ញឹកញាប់ពេក

---

## Troubleshooting

**បញ្ហា: Sync failed**
- ពិនិត្យ internet connection
- AnimKill.com server អាចនឹង down

**បញ្ហា: Data មិន update នៅ website**
- Dev mode: Refresh browser (Ctrl+R)
- Production: Run `npm run build` ហើយ restart server

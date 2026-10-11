const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchPage(page) {
  return new Promise((resolve) => {
    https.get({
      hostname: 'animekill.com',
      path: `/api/data/anime-list?limit=100&page=${page}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          resolve(json.data);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function cleanTitle(str) {
  if (!str) return '';
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

async function syncAll1386Anime() {
  console.log('=== Starting Full Import of all 1,386 Anime from AnimeKill ===');
  
  // 1. Get first page to find total pages
  const first = await fetchPage(1);
  if (!first || !first.results) {
    console.error('Failed to fetch page 1');
    return;
  }

  const total = first.total || 1386;
  const totalPages = first.total_pages || Math.ceil(total / 100);
  console.log(`Total anime: ${total}, Total pages to fetch: ${totalPages}`);

  const allItems = [...first.results];

  // Fetch remaining pages in parallel batches
  for (let p = 2; p <= totalPages; p += 3) {
    const batch = [];
    for (let i = p; i < p + 3 && i <= totalPages; i++) {
      batch.push(fetchPage(i));
    }
    const results = await Promise.all(batch);
    for (const r of results) {
      if (r && r.results) {
        allItems.push(...r.results);
      }
    }
    console.log(`Fetched through page ${Math.min(p + 2, totalPages)} / ${totalPages} (Total loaded: ${allItems.length})`);
  }

  console.log(`Successfully fetched all ${allItems.length} anime items!`);

  // Map into our catalog format
  const catalog = {
    updated_at: new Date().toISOString(),
    total_animes: allItems.length,
    latest: allItems.slice(0, 36).map(item => ({
      epSlug: item.episode_url ? item.episode_url.replace(/^\//, '') : `${item.slug}-episode-${item.episode_number || 1}`,
      epNum: item.episode_number || 1,
      title: item.title,
      animeSlug: item.slug,
      poster: item.large_poster ? `https://animekill.com${item.large_poster}` : `https://animekill.com${item.small_poster}`
    })),
    animes: {}
  };

  for (const item of allItems) {
    const slug = item.slug || item.anime_id;
    if (!slug) continue;

    const poster = item.large_poster
      ? `https://animekill.com${item.large_poster}`
      : item.small_poster
      ? `https://animekill.com${item.small_poster}`
      : `https://animekill.com/poster/${slug}-hd.webp`;

    catalog.animes[slug] = {
      slug,
      title: item.title || cleanTitle(slug),
      synonyms: item.synonyms || null,
      poster,
      anime_type: item.anime_type || (item.anime_origin === 'chinese' ? 'Donghua' : 'Anime'),
      genre: item.genre || 'Action, Fantasy',
      genres: item.genre ? item.genre.split(',').map(g => g.trim()) : ['Action', 'Fantasy'],
      score: item.score || '8.8',
      total_watch: item.total_watch || 1000,
      total_episodes: item.episode_number || 24,
      latest_episode_url: item.episode_url || `/${slug}-episode-${item.episode_number || 1}`
    };
  }

  const outPath = path.join(__dirname, '..', 'src', 'data', 'animekill_catalog.json');
  fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2));
  console.log(`Saved catalog to ${outPath} with ${Object.keys(catalog.animes).length} anime series!`);
}

syncAll1386Anime().catch(console.error);

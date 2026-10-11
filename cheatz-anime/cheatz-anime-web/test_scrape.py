import urllib.request, json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

# Try to fetch episode page from animekill.com
slug = 'renegade-immortal-episode-161'
url = f'https://animekill.com/{slug}'
print(f'Fetching: {url}')

req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'RSC': '1',
    'Accept': 'text/x-component, */*',
})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    text = resp.read().decode('utf-8', errors='ignore')
    print(f'Response length: {len(text)}')
    
    # Look for video_host/video_path
    m = re.search(r'"video_host":"([^"]+)","video_path":"([^"]+)"', text)
    if m:
        host = m.group(1).replace('\\/', '/').replace('\\', '')
        path = m.group(2).replace('\\u0026', '&').replace('\\', '')
        full = host if host.startswith('http') else f'https://{host}'
        print(f'video_host: {host}')
        print(f'video_path: {path}')
        print(f'Full URL: {full}{path}')
    else:
        print('No video_host/video_path found')
    
    # Look for dailymotion
    dm = re.search(r'(https?://(?:www\.)?dailymotion\.com/embed/video/[a-zA-Z0-9_-]+)', text)
    if dm:
        print(f'Dailymotion: {dm.group(1)}')
    
    # Look for geo.dailymotion
    geo = re.search(r'(https://geo\.dailymotion\.com/player/[^\s"\\<>]+)', text)
    if geo:
        print(f'Geo player: {geo.group(1)}')
    
    # Look for donghuaworld
    dw = re.search(r'(https?://playing\.donghuaworld\.in/[^\s"\\<>]+)', text)
    if dw:
        print(f'Donghuaworld: {dw.group(1)}')
    
    # Look for ok.ru
    ok = re.search(r'(https?://ok\.ru/videoembed/[0-9]+)', text)
    if ok:
        print(f'OK.ru: {ok.group(1)}')
    
    # Look for m3u8 or mp4
    m3u8 = re.search(r'(https?://[^\s"\\<>]+\.m3u8[^\s"\\<>]*)', text)
    if m3u8:
        print(f'HLS: {m3u8.group(1)}')
    
    mp4 = re.search(r'(https?://[^\s"\\<>]+\.mp4[^\s"\\<>]*)', text)
    if mp4:
        print(f'MP4: {mp4.group(1)}')
    
    # Look for any embed URL
    embed = re.search(r'(https?://[^\s"\\<>]*(?:player|embed|stream)[^\s"\\<>]*)', text)
    if embed and 'animekill' not in embed.group(1):
        print(f'Embed: {embed.group(1)}')
    
    # Show context around 'video' keyword
    idx = text.lower().find('video')
    if idx >= 0:
        snippet = text[max(0,idx-20):idx+80]
        print(f'Video context: {snippet}')
    
    # Show first 500 chars
    print(f'\nFirst 300 chars: {text[:300]}')
    
except Exception as e:
    print(f'Error: {e}')

const CACHE_PREFIX = 'utilora-pwa-';
const CACHE_VERSION = '2026-11-01-v1';
const SHELL_CACHE = CACHE_PREFIX + 'shell-' + CACHE_VERSION;
const PAGES_CACHE = CACHE_PREFIX + 'pages-' + CACHE_VERSION;
const ASSETS_CACHE = CACHE_PREFIX + 'assets-' + CACHE_VERSION;
const MAX_CACHED_PAGES = 36;
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/pwa-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, PAGES_CACHE, ASSETS_CACHE]);
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith(CACHE_PREFIX) && !keep.has(name))
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

function isSafeHtmlToCache(response) {
  if (!response || !response.ok) return false;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('text/html')) return false;
  const cacheControl = response.headers.get('cache-control') || '';
  if (/\b(private|no-store)\b/i.test(cacheControl)) return false;
  return true;
}

async function saveVisitedPage(request, response) {
  if (!isSafeHtmlToCache(response)) return;
  const cache = await caches.open(PAGES_CACHE);
  await cache.put(request, response.clone());
  const keys = await cache.keys();
  if (keys.length > MAX_CACHED_PAGES) {
    await cache.delete(keys[0]);
  }
}

async function offlineDocument() {
  const cached = await caches.match('/offline.html');
  if (cached) {
    return new Response(await cached.text(), {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  return new Response('UTILORA is offline. Reconnect and try again.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    await saveVisitedPage(request, response);
    return response;
  } catch {
    const pages = await caches.open(PAGES_CACHE);
    const cachedPage = await pages.match(request);
    return cachedPage || offlineDocument();
  }
}

async function handleVersionedAsset(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const cachedAsset = await cache.match(request);
  if (cachedAsset) return cachedAsset;

  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cachedAsset || new Response('', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Vite production assets are content-hashed, so cache-first avoids stale bundles.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(handleVersionedAsset(request));
  }
});

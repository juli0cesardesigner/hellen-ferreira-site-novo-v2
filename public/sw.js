const CACHE_NAME = 'hf-site-v7';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icons/192x192.png',
  '/brand/black.png'
];

// Static pages that can be served offline (informational pages)
const OFFLINE_PAGES = [
  '/',
  '/sobre',
  '/ensaios',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add assets that must be cached
      cache.addAll(ASSETS_TO_CACHE);
      // Try to cache offline pages without breaking the install if they fail
      OFFLINE_PAGES.forEach((page) => {
        cache.add(page).catch((err) => console.log('Failed to cache offline page:', page, err));
      });
      return Promise.resolve();
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Network-first for navigation (ensures fresh content), cache fallback for offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Static assets: cache-first
  if (ASSETS_TO_CACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Navigation requests: network-first with offline fallback for static pages
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful navigations for offline fallback
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            // Ultimate fallback to prevent iOS "This page couldn't load"
            return cached || caches.match('/') || new Response(
              '<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Você está offline</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background-color:#FCFBF9;color:#3C3C3B;}h1{font-weight:400;margin-bottom:10px;}p{color:#6D6B69;}</style></head><body><h1>Conexão Indisponível</h1><p>Verifique sua internet e tente novamente.</p></body></html>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          });
        })
    );
    return;
  }
});

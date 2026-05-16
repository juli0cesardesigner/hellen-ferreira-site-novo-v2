const CACHE_NAME = 'hf-site-v9';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icons/192x192.png',
  '/brand/black.png'
];

// Static pages that can be served offline (informational pages only)
const OFFLINE_PAGES = [
  '/',
  '/sobre',
  '/ensaios',
];

// Routes that must NEVER be cached (dynamic, auth-protected)
const NO_CACHE_PATHS = [
  '/admin',
  '/api/',
  '/agendar',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(ASSETS_TO_CACHE);
      OFFLINE_PAGES.forEach((page) => {
        cache.add(page).catch(() => {});
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

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NEVER intercept admin, API, or auth-protected routes — let the browser handle them directly
  if (NO_CACHE_PATHS.some((path) => url.pathname.startsWith(path))) {
    return; // Don't call event.respondWith — pass through to network
  }

  // Static assets: cache-first
  if (ASSETS_TO_CACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Navigation requests: network-first, only cache 200 OK responses (never redirects)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful (200) responses, never redirects (3xx)
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return caches.match('/').then((cachedRoot) => {
              if (cachedRoot) return cachedRoot;
              return new Response(
                '<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Offline</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background:#FCFBF9;color:#3C3C3B}h1{font-weight:400;margin-bottom:10px}p{color:#6D6B69}</style></head><body><h1>Conexão Indisponível</h1><p>Verifique sua internet e tente novamente.</p></body></html>',
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
              );
            });
          });
        })
    );
    return;
  }
});

const CACHE_NAME = 'hf-admin-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/192x192.png',
  '/brand/black.png',
  '/brand/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não sejam GET ou para extensões/chrome-extension
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a rede funcionar, retorna a resposta
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tenta buscar no cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se não tiver no cache e for uma navegação, tenta o fallback para a raiz ou admin
          if (event.request.mode === 'navigate') {
            return caches.match('/admin') || caches.match('/');
          }
        });
      })
  );
});

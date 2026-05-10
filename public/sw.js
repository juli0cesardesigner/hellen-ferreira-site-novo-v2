const CACHE_NAME = 'hf-admin-v4';
const ASSETS_TO_CACHE = [
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
  // Não interferir com navegação ou chamadas de API do Supabase/Vercel
  // Apenas servir ícones e manifest do cache para garantir instalabilidade
  
  const url = new URL(event.request.url);
  
  // Se for um asset estático que está no nosso cache, servimos do cache
  if (ASSETS_TO_CACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Para todo o resto, rede pura. Isso evita erros de redirecionamento (307) do middleware do Next.js
  return;
});

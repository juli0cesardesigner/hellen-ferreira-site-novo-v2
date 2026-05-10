const CACHE_NAME = 'hf-admin-v5';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icons/192x192.png',
  '/brand/black.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

// Estratégia Ultra-Resiliente: 
// 1. Navegação sempre vai direto para a rede (evita conflito com 307 de login)
// 2. Assets estáticos do cache (ícones)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Se for navegação (abrir a página admin), NÃO interceptamos.
  // Isso permite que o browser lide nativamente com o redirecionamento para o login.
  if (event.request.mode === 'navigate') {
    return; 
  }

  // Apenas interceptamos se for um asset estático conhecido
  if (ASSETS_TO_CACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
  }
});

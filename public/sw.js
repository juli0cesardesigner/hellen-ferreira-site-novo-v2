const CACHE_NAME = 'hf-admin-v2';
const ASSETS_TO_CACHE = [
  '/admin',
  '/manifest.json',
  '/icons/192x192.png',
  '/brand/black.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

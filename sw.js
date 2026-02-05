
const CACHE_NAME = 'traffic-inventory-v2';
// This list is minimal because we cache assets on the fly.
const PRECACHE_ASSETS = [
  '/',
  '/index.html'
];

// On install, pre-cache the app shell.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching App Shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// On activate, clean up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// On fetch, serve from cache first, then network.
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return response from cache if found.
        // Fetch from network, cache it, and return response as a fallback.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            // We can only cache basic and cors requests from esm.sh
            const shouldCache = networkResponse.type === 'basic' || (networkResponse.type === 'cors' && event.request.url.includes('esm.sh'));
            if (shouldCache) {
              cache.put(event.request, networkResponse.clone());
            }
          }
          return networkResponse;
        });

        // Return the cached response if available, otherwise wait for the network
        return response || fetchPromise;
      });
    })
  );
});

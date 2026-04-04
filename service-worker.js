service-worker.js

const CACHE_NAME = 'aether-scribe-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
  // When you build the final React app, your JS and CSS bundles will automatically be cached too!
];

// 1. INSTALLATION: Cache the core files immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Aether Scribe: Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 2. ACTIVATION: Clean up old caches if we update the app
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Aether Scribe: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. FETCHING: The AAA Magic. Intercept network requests!
self.addEventListener('fetch', (event) => {
  // If the app is asking for a GitHub image or JSON file, check the cache first!
  if (event.request.url.includes('raw.githubusercontent.com') || event.request.url.includes('api.github.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Return instant cached version!
        }
        // Otherwise, fetch it from GitHub and cache it for next time
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Standard network request for everything else
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
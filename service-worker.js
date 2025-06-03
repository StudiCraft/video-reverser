// Define the cache name
const CACHE_NAME = 'video-reverser-cache-v1';

// List the files to cache
const urlsToCache = [
  './video-reverser/index.html', // Changed to index.html
  './video-reverser/manifest.json',
  './video-reverser/service-worker.js',
  // Ensure all icon paths are correct relative to the root
  './video-reverser/icons/icon-72x72.png',
  './video-reverser/icons/icon-96x96.png',
  './video-reverser/icons/icon-128x128.png',
  './video-reverser/icons/icon-144x144.png',
  './video-reverser/icons/icon-152x152.png',
  './video-reverser/icons/icon-192x192.png',
  './video-reverser/icons/icon-384x384.png',
  './video-reverser/icons/icon-512x512.png'
];

// Install event: caches the static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

// Fetch event: serves cached content or fetches from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We must clone it so that
            // we can consume one in the cache and one in the browser.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        // You can return a fallback page here for offline scenarios
        // For example: return caches.match('/offline.html');
      })
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
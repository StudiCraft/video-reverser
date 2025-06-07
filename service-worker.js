// Define the cache name
// It's good practice to version your cache names to ensure that updates to the service worker
// will result in a new cache being used, avoiding conflicts with older cached assets.
const CACHE_NAME = 'video-reverser-cache-v1';

// List the files to cache
// These are the core files needed for the app to work offline.
// Paths should be relative to the service worker's location, or absolute paths.
const urlsToCache = [
  './video-reverser/index.html', // Main HTML file
  './video-reverser/manifest.json', // PWA manifest file
  './video-reverser/service-worker.js', // The service worker itself (can be cached but handled by browser)
  // App icons for different resolutions
  './video-reverser/icons/icon-72x72.png',
  './video-reverser/icons/icon-96x96.png',
  './video-reverser/icons/icon-128x128.png',
  './video-reverser/icons/icon-144x144.png',
  './video-reverser/icons/icon-152x152.png',
  './video-reverser/icons/icon-192x192.png', // Commonly used for PWA home screen icon
  './video-reverser/icons/icon-384x384.png',
  './video-reverser/icons/icon-512x512.png'  // Commonly used for PWA splash screen icon
];

// --- Install Event ---
// This event is triggered when the service worker is first installed or when a new version is detected.
// Its primary purpose is to prepare the service worker for use, typically by caching static assets.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // event.waitUntil() ensures that the service worker will not install until the code inside has finished executing.
  event.waitUntil(
    caches.open(CACHE_NAME) // Open the specified cache by name.
      .then((cache) => {
        console.log('Service Worker: Opened cache:', CACHE_NAME);
        // cache.addAll() takes a list of URLs, fetches them, and adds the responses to the cache.
        // This is an atomic operation; if any file fails to cache, the entire operation fails.
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: All static assets cached successfully.');
      })
      .catch(error => {
        // If caching fails, log the error. This can help debug issues with paths or network connectivity during installation.
        console.error('Service Worker: Failed to cache static assets during install:', error);
      })
  );
});

// --- Fetch Event ---
// This event is triggered for every network request made by the page (e.g., for HTML, CSS, JS, images).
// It allows the service worker to intercept the request and respond with cached assets or fetch from the network.
// Caching Strategy: Cache-first, then network.
// 1. Try to find the requested asset in the cache.
// 2. If found (cache hit), serve it from the cache for a fast response.
// 3. If not found (cache miss), fetch the asset from the network.
// 4. After fetching from the network, cache the response for future requests.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request) // Check if the request matches any entry in the cache.
      .then((cachedResponse) => {
        // If a cached response is found, return it.
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // If the request is not in the cache, fetch it from the network.
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response from the network.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              // 'basic' type indicates requests from our origin. Other types (e.g., 'opaque') are for cross-origin resources
              // and cannot be cached by default due to security restrictions unless CORS is properly configured.
              return networkResponse; // Return the problematic response as is (won't be cached).
            }

            // IMPORTANT: Clone the response. A response is a stream and can only be consumed once.
            // We need one copy to serve to the browser and another to put into the cache.
            const responseToCache = networkResponse.clone();

            // Open the cache and add the newly fetched response to it.
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache); // Cache the fetched resource.
              });

            return networkResponse; // Return the original network response to the browser.
          }
        ).catch(error => {
          // This catch handles errors during the fetch operation itself (e.g., network offline).
          console.error('Service Worker: Fetch failed; returning offline fallback or error:', error);
          // Optionally, return a fallback page for offline scenarios:
          // return caches.match('/offline.html');
          // Or simply re-throw the error if no fallback is available or appropriate for the request.
        });
      })
      // This catch handles errors from caches.match() itself, though less common.
      .catch(error => {
        console.error('Service Worker: Error matching cache during fetch:', error);
        // Potentially try to fetch from network as a last resort or return a generic fallback.
        return fetch(event.request);
      })
  );
});

// --- Activate Event ---
// This event is triggered after the service worker has been installed and when it becomes the active service worker.
// It's primarily used to clean up old caches that are no longer needed, ensuring that the app
// doesn't store outdated assets and frees up storage space.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Define a whitelist of cache names that should be kept. Typically, this includes the current CACHE_NAME.
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => { // Get all cache names currently stored by the origin.
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If a cache name is not in the whitelist, it's an old cache and should be deleted.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName); // Delete the outdated cache.
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Old caches cleaned up successfully.');
      // After activation and cleanup, it's a good practice to have the service worker take control of uncontrolled clients.
      return self.clients.claim();
    })
  );
});
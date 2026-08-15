// StudioOS Service Worker - Offline Caching Engine
const CACHE_NAME = 'studioos-app-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/favicon.ico',
];

// Install event: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching core application assets for offline resilience');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache warning for non-critical assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-First with Cache Fallback for dynamic requests, Cache-First for static
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests or chrome-extension URLs
  if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // If good response, clone and update cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Network failed (offline) - try to serve from cache
        console.log('[ServiceWorker] Network unavailable. Serving from offline cache for:', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If navigating to an HTML page, serve cached root index.html
        if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
          const fallback = await caches.match('/index.html') || await caches.match('/');
          if (fallback) return fallback;
        }

        return new Response('StudioOS Offline Mode Active. Local application data cached in browser storage.', {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
  );
});

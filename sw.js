// AquaTracker Service Worker - Updated for Theme Fix
const CACHE_NAME = 'aquatracker-v3.1.0'; // UPDATED VERSION NUMBER
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './offline.html'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Force the active service worker to take control of all clients
  return self.clients.claim();
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', (event) => {
  // For CSS and JS files, always try network first for theme updates
  if (event.request.url.includes('style.css') || event.request.url.includes('app.js')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If network succeeds, update cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, serve from cache
          return caches.match(event.request);
        })
    );
  } else {
    // For other files, use cache first
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request);
        })
    );
  }
});

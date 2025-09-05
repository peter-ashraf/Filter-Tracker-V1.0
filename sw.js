// AquaTracker Service Worker - GitHub Pages Compatible
const CACHE_NAME = 'aquatracker-v3.0.0';
const STATIC_CACHE = 'aquatracker-static-v3.0.0';

const STATIC_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './offline.html'
];

self.addEventListener('install', event => {
  console.log('[SW] Installing AquaTracker service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Cache failed:', err);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('./offline.html');
        }
      })
  );
});

// Push notification handling
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Filter replacement reminder',
    icon: './icon-192.png',
    badge: './icon-72.png',
    tag: 'filter-reminder',
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification('💧 Filter Reminder', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll()
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
  );
});

console.log('[SW] AquaTracker Service Worker loaded');
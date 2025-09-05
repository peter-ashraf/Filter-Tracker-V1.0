// AquaTracker Service Worker - Complete PWA Support
const CACHE_NAME = 'aquatracker-v1.0.0';
const STATIC_CACHE = 'aquatracker-static-v1.0.0';

const STATIC_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './offline.html'
];

console.log('🔧 AquaTracker Service Worker loading...');

// Install Event
self.addEventListener('install', event => {
  console.log('📦 SW: Installing AquaTracker service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 SW: Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ SW: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('❌ SW: Cache failed:', err);
      })
  );
});

// Activate Event
self.addEventListener('activate', event => {
  console.log('🚀 SW: Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE) {
              console.log('🗑️ SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ SW: Service worker activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch Event - Network-first with cache fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If we got a valid response, clone it and cache it
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // If it's a navigation request and not in cache, return offline page
            if (event.request.destination === 'document') {
              return caches.match('./offline.html');
            }
            
            // For other requests, return a basic offline response
            return new Response('Offline', { 
              status: 503, 
              statusText: 'Service Unavailable' 
            });
          });
      })
  );
});

// Background Sync (for future notification scheduling)
self.addEventListener('sync', event => {
  console.log('🔄 SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'filter-reminder') {
    event.waitUntil(
      // Future: Sync with server or send notifications
      console.log('📅 SW: Processing filter reminders...')
    );
  }
});

// Push Notification Handling
self.addEventListener('push', event => {
  console.log('📬 SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : '💧 Time to check your water filters!',
    icon: './icon-192.png',
    badge: './icon-72.png',
    tag: 'filter-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Filters'
      },
      {
        action: 'snooze',
        title: 'Remind Later'
      }
    ],
    data: {
      url: './'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('🔔 AquaTracker Reminder', options)
  );
});

// Notification Click Handling
self.addEventListener('notificationclick', event => {
  console.log('📱 SW: Notification clicked:', event.action);
  
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || './';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Message handling (for communication with main app)
self.addEventListener('message', event => {
  console.log('💬 SW: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});

// Periodic Background Sync (for browsers that support it)
self.addEventListener('periodicsync', event => {
  console.log('⏰ SW: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'filter-check') {
    event.waitUntil(
      // Future: Check filter due dates and send notifications
      console.log('📊 SW: Checking filter due dates...')
    );
  }
});

console.log('✅ AquaTracker Service Worker loaded successfully');
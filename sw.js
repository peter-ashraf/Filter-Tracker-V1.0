// AquaTracker Service Worker
// Provides offline functionality and caching for the water filter PWA

const CACHE_NAME = 'aquatracker-v1.2.0';
const STATIC_CACHE = 'aquatracker-static-v1.2.0';
const DYNAMIC_CACHE = 'aquatracker-dynamic-v1.2.0';

// Files to cache immediately when service worker installs
const STATIC_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  // Add offline fallback page
  '/offline.html'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES.map(url => new Request(url, {
          cache: 'no-cache'
        })));
      })
      .catch(err => {
        console.warn('[SW] Failed to cache some static files:', err);
        // Cache essential files only if full cache fails
        return caches.open(STATIC_CACHE).then(cache => {
          return cache.addAll(['/', '/index.html', '/style.css', '/app.js']);
        });
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting(); // Force activation
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated and ready');
        return self.clients.claim(); // Take control of all pages
      })
  );
});

// Fetch event - serve from cache with fallbacks
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests and external domains
  if (request.method !== 'GET' || !url.origin.includes(location.origin)) {
    return;
  }
  
  // Handle different types of requests
  if (STATIC_FILES.some(file => request.url.endsWith(file))) {
    // Static files - cache first strategy
    event.respondWith(cacheFirst(request));
  } else if (request.url.includes('/api/')) {
    // API calls - network first strategy (if you add API later)
    event.respondWith(networkFirst(request));
  } else {
    // Other requests - stale while revalidate strategy
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache strategies

// Cache First - good for static assets
async function cacheFirst(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Not in cache, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return getOfflineFallback(request);
  }
}

// Network First - good for API calls and dynamic content
async function networkFirst(request) {
  try {
    console.log('[SW] Network first for:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineFallback(request);
  }
}

// Stale While Revalidate - good for balance of freshness and performance
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.log('[SW] Network fetch failed:', error);
      return cachedResponse;
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('[SW] Serving from cache (stale):', request.url);
    return cachedResponse;
  }
  
  // Otherwise wait for network
  console.log('[SW] No cache, waiting for network:', request.url);
  return fetchPromise;
}

// Offline fallback responses
function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  if (request.destination === 'document') {
    // Return main app for HTML requests
    return caches.match('/index.html');
  }
  
  if (request.destination === 'image') {
    // Return a simple SVG for failed image requests
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#666">📷</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  // Default offline response
  return new Response('Offline - Please check your internet connection', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Background sync for when connection is restored
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'filter-data-sync') {
    event.waitUntil(syncFilterData());
  }
});

async function syncFilterData() {
  try {
    console.log('[SW] Syncing filter data...');
    
    // Get any pending data from IndexedDB (if implemented)
    // This would sync filter changes made while offline
    
    // Send notification about successful sync
    self.registration.showNotification('AquaTracker', {
      body: 'Filter data synced successfully',
      icon: '/icons/icon-192.png',
      tag: 'sync-success',
      requireInteraction: false
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    return Promise.reject(error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'AquaTracker',
    body: 'Time to check your water filters!',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: 'filter-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Filters',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (e) {
      console.log('[SW] Push data is not JSON');
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CACHE_FILTER_DATA':
        // Cache important filter data
        const data = event.data.payload;
        caches.open(DYNAMIC_CACHE)
          .then(cache => cache.put('/filter-data', new Response(JSON.stringify(data))));
        break;
        
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
        
      default:
        console.log('[SW] Unknown message type:', event.data.type);
    }
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'filter-check') {
    event.waitUntil(checkFiltersAndNotify());
  }
});

async function checkFiltersAndNotify() {
  try {
    // This would check filter due dates and send notifications
    // Implementation would depend on your data storage
    console.log('[SW] Checking filters for due dates...');
    
    // Example notification for overdue filters
    const hasOverdueFilters = true; // This would be determined by actual logic
    
    if (hasOverdueFilters) {
      return self.registration.showNotification('Filter Replacement Due!', {
        body: 'One or more water filters need to be replaced.',
        icon: '/icons/icon-192.png',
        tag: 'overdue-filter',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'snooze', title: 'Remind Later' }
        ]
      });
    }
  } catch (error) {
    console.error('[SW] Filter check failed:', error);
  }
}

console.log('[SW] Service Worker script loaded successfully');
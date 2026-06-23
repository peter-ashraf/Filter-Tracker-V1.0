// AquaTracker Service Worker - PWA cache plus real Web Push delivery
const CACHE_NAME = 'aquatracker-v4.0.0';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './offline.html',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => cacheName === CACHE_NAME ? null : caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.url.includes('style.css') || event.request.url.includes('app.js')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => caches.match('./offline.html'))
  );
});

self.addEventListener('push', (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (_) {
      payload = { title: 'AquaTracker', body: event.data.text() };
    }
  }

  const title = payload.title || 'AquaTracker Reminder';
  const options = {
    body: payload.body || 'A water filter reminder is ready.',
    icon: payload.icon || './icons/icon-192.png',
    badge: payload.badge || './icons/icon-192.png',
    tag: payload.tag || 'aquatracker-reminder',
    data: payload.data || { url: './' },
    requireInteraction: Boolean(payload.requireInteraction),
    actions: payload.actions || [{ action: 'view-filter', title: 'View' }, { action: 'dismiss', title: 'Dismiss' }],
    timestamp: Date.now()
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const data = event.notification.data || {};
  const targetUrl = new URL(data.url || './', self.registration.scope).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('notificationclose', () => {
  // Delivery/open analytics can be added here later without affecting local data.
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-backup') {
    event.waitUntil(notifyOpenClients({ type: 'PERFORM_BACKUP' }));
  }
});

self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};

  if (type === 'REGISTER_PERIODIC_SYNC') {
    event.waitUntil(registerPeriodicSync(data?.tag, data?.minInterval));
  }

  if (type === 'SCHEDULE_NOTIFICATION' && data?.title) {
    event.waitUntil(self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || './icons/icon-192.png',
      badge: data.badge || './icons/icon-192.png',
      tag: data.tag || 'aquatracker-local-test',
      data: data.data || {},
      requireInteraction: Boolean(data.requireInteraction)
    }));
  }
});

async function notifyOpenClients(message) {
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  clientList.forEach((client) => client.postMessage(message));
}

async function registerPeriodicSync(tag, minInterval) {
  if (!tag || !('periodicSync' in self.registration)) return;

  try {
    await self.registration.periodicSync.register(tag, {
      minInterval: minInterval || 24 * 60 * 60 * 1000
    });
  } catch (_) {
    // Periodic Sync is optional and browser-dependent. Server-side notifications do not rely on it.
  }
}

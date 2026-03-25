// AquaTracker Service Worker - Enhanced with True Background Notifications
const CACHE_NAME = 'aquatracker-v3.1.0'; // UPDATED VERSION NUMBER
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './offline.html'
];

// Background notification scheduling storage
let scheduledNotifications = [];
let backgroundCheckInterval = null;

// Install event - cache files and start background checking
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Start background notification checking immediately
        startBackgroundNotificationChecking();
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches and start background checking
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force active service worker to take control of all clients
      return self.clients.claim();
    }).then(() => {
      // Start background notification checking after activation
      
      startBackgroundNotificationChecking();
    })
  );
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

// Push notification event handler
self.addEventListener('push', (event) => {
  
  
  if (!event.data) {
    
    return;
  }

  const options = event.data.json();
  

  event.waitUntil(
    self.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '💧',
      badge: options.badge || '💧',
      tag: options.tag || 'aquatracker',
      data: options.data || {},
      requireInteraction: options.requireInteraction || false,
      actions: options.actions || [],
      timestamp: Date.now()
    })
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'view-filter' && data.filterId) {
    // Open app and navigate to specific filter
    event.waitUntil(
      clients.openWindow(`./index.html#filter-${data.filterId}`)
    );
  } else if (action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        for (const client of clientList) {
          if (client.url === self.registration.scope && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
    );
  }
});

// Periodic sync for background tasks
self.addEventListener('periodicsync', (event) => {
  
  
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkAndScheduleNotifications());
  }
  
  if (event.tag === 'daily-backup') {
    event.waitUntil(performDailyBackup());
  }
});

// Check and schedule notifications
async function checkAndScheduleNotifications() {
  try {
    
    
    // Get all open clients
    const clients = await self.clients.matchAll();
    if (clients.length === 0) {
      
      return;
    }
    
    // Send message to main app to check reminders
    const client = clients[0];
    client.postMessage({
      type: 'CHECK_REMINDERS'
    });
    
  } catch (error) {
    
  }
}

// Perform daily backup
async function performDailyBackup() {
  try {
    
    
    // Get all open clients
    const clients = await self.clients.matchAll();
    if (clients.length === 0) {
      
      return;
    }
    
    // Send message to main app to perform backup
    const client = clients[0];
    client.postMessage({
      type: 'PERFORM_BACKUP'
    });
    
  } catch (error) {
    
  }
}

// Message handler from main app
self.addEventListener('message', (event) => {
  
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SCHEDULE_NOTIFICATION':
      scheduleNotification(data);
      break;
    case 'CANCEL_NOTIFICATION':
      cancelNotification(data.id);
      break;
    case 'REGISTER_PERIODIC_SYNC':
      registerPeriodicSync(data.tag, data.minInterval);
      break;
    default:
      
  }
});

// Start background notification checking
function startBackgroundNotificationChecking() {
  
  
  // Clear any existing interval
  if (backgroundCheckInterval) {
    clearInterval(backgroundCheckInterval);
  }
  
  // Check notifications every hour (3600000 ms)
  backgroundCheckInterval = setInterval(() => {
    checkAndSendBackgroundNotifications();
  }, 3600000); // 1 hour
  
  // Also check immediately on start
  setTimeout(() => {
    checkAndSendBackgroundNotifications();
  }, 5000); // 5 seconds after service worker starts
}

// Check and send background notifications
async function checkAndSendBackgroundNotifications() {
  
  
  try {
    // Get filters from localStorage (service worker can access this)
    const filters = await getFiltersFromStorage();
    const today = new Date();
    
    for (const filter of filters) {
      await checkFilterForNotification(filter, today);
    }
  } catch (error) {
    
  }
}

// Get filters from localStorage
function getFiltersFromStorage() {
  try {
    // Service worker can access localStorage directly
    const filters = JSON.parse(localStorage.getItem('filters') || '[]');
    
    return filters;
  } catch (error) {
    
    return [];
  }
}

// Check individual filter for notifications
async function checkFilterForNotification(filter, today) {
  const settings = filter.notificationSettings;
  if (!settings) return;

  const dueDate = new Date(filter.nextDueDate);
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  // Check buy reminder
  if (settings.buyReminder && settings.buyReminder.enabled) {
    const buyReminderDays = settings.buyReminder.timing;
    if (daysUntilDue === buyReminderDays) {
      await sendBackgroundNotification({
        type: 'buy-reminder',
        filter: filter,
        title: `🛒 Time to buy ${filter.name}`,
        body: `${filter.name} at ${filter.location} needs replacement in ${buyReminderDays} days. Order now to avoid interruption!`,
        tag: `buy-${filter.id}`,
        data: { filterId: filter.id, type: 'buy-reminder' }
      });
    }
  }

  // Check replace reminder
  if (settings.replaceReminder && settings.replaceReminder.enabled) {
    const replaceReminderDays = settings.replaceReminder.timing;
    if (daysUntilDue <= replaceReminderDays) {
      await sendBackgroundNotification({
        type: 'replace-reminder',
        filter: filter,
        title: `🔄 Replace ${filter.name}`,
        body: `${filter.name} at ${filter.location} is due for replacement today!`,
        tag: `replace-${filter.id}`,
        data: { filterId: filter.id, type: 'replace-reminder' },
        requireInteraction: true
      });
    }
  }

  // Check critical overdue
  if (settings.criticalReminder && settings.criticalReminder.enabled) {
    const criticalDays = settings.criticalReminder.threshold;
    if (daysUntilDue < -criticalDays) {
      await sendBackgroundNotification({
        type: 'critical-overdue',
        filter: filter,
        title: `🚨 ${filter.name} is CRITICALLY OVERDUE`,
        body: `${filter.name} at ${filter.location} is ${Math.abs(daysUntilDue)} days overdue! Immediate replacement required!`,
        tag: `critical-${filter.id}`,
        data: { filterId: filter.id, type: 'critical-overdue' },
        requireInteraction: true
      });
    }
  }
}

// Send background notification
async function sendBackgroundNotification(options) {
  
  
  try {
    // Check if notifications are enabled
    const notificationsEnabled = localStorage.getItem('notifications-enabled') === 'true';
    if (!notificationsEnabled) {
      
      return;
    }
    
    // Send the notification through service worker
    await self.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '💧',
      tag: options.tag || 'aquatracker',
      data: options.data || {},
      requireInteraction: options.requireInteraction || false,
      silent: false
    });
    
    
  } catch (error) {
    
  }
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  
  
  const notification = event.notification;
  const notificationData = notification.data || {};
  
  // Close the notification
  event.notification.close();
  
  // Handle different notification types
  switch (notificationData.type) {
    case 'buy-reminder':
    case 'replace-reminder':
    case 'critical-overdue':
      // Open the app and focus on the specific filter
      event.waitUntil(
        clients.matchAll().then(clientList => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes('index.html') && 'focus' in client) {
              return client.focus();
            }
          }
          // If app is not open, open it
          if (clients.openWindow) {
            return clients.openWindow('/?filter=' + notificationData.filterId);
          }
        })
      );
      break;
    default:
      // Just open the app
      event.waitUntil(
        clients.matchAll().then(clientList => {
          for (const client of clientList) {
            if (client.url.includes('index.html') && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
      );
  }
});

// Notification close handler (optional tracking)
self.addEventListener('notificationclose', (event) => {
  
  // Could track closed notifications here
});

// Register periodic sync
async function registerPeriodicSync(tag, minInterval) {
  try {
    const registration = await self.registration;
    if ('periodicSync' in registration) {
      // Check if we have permission
      try {
        const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
        if (status.state === 'granted') {
          await registration.periodicSync.register(tag, {
            minInterval: minInterval || 24 * 60 * 60 * 1000 // 24 hours
          });
          
          return;
        } else {
          
        }
      } catch (permError) {
        
      }
    } else {
      
    }
  } catch (error) {
    
  }
  
  // Fallback to setTimeout for periodic checks
  
  setInterval(() => {
    if (tag === 'daily-backup') {
      performDailyBackup();
    }
    if (tag === 'check-reminders') {
      checkAndScheduleNotifications();
    }
  }, minInterval || 24 * 60 * 60 * 1000);
}

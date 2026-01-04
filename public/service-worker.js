// SERVICE WORKER - NETWORK FIRST STRATEGY (No Plugins)
const CACHE_NAME = 'workout-tracker-net-first-v3'; 

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/App.jsx',
  '/js/config/api.js',
  '/js/utils/workoutHelpers.js',
  '/js/utils/wakeLock.js',
  '/js/components/icons/AuthIcons.jsx',
  '/js/components/icons/TrackerIcons.jsx',
  '/js/components/Auth/AuthScreen.jsx',
  '/js/components/Library/WorkoutLibrary.jsx',
  '/js/components/Tracker/WorkoutTracker.jsx',
  '/js/components/Tracker/WorkoutTrackerWithCloud.jsx',
  '/icons/icon-192x192.png'
];

// 1. INSTALL: Cache assets immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force this new SW to activate immediately
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Take control of all pages immediately
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. FETCH: Network First (with Cache Fallback)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // ONLINE: We got a fresh response from the server
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clone and Cache the fresh version
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      })
      .catch(() => {
        // OFFLINE: Network failed, fall back to cache
        console.log('Network failed, serving offline cache for:', event.request.url);
        return caches.match(event.request);
      })
  );
});
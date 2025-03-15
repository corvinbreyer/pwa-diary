const CACHE_NAME = 'todo-app-v1';
const ASSETS_TO_CACHE = [
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install: Cache assets
self.addEventListener('install', (event) => {
    console.log('💾 [SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('💾 [SW] Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate: Remove old caches
self.addEventListener('activate', (event) => {
    console.log('✅ [SW] Activating...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

/*// Fetch: Serve from cache
self.addEventListener('fetch', (event) => {
    console.log('🌐 [SW] Fetch:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});*/

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request).catch(() => {
                return caches.match('/index.html'); // Fallback to index.html when offline
            });
        })
    );
});
const CACHE_NAME = 'moodtracker';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    
    '/css/variables.css',
    '/css/custom.css',
    '/css/theme.css',
    
    '/js/calendar.js',
    '/js/customization.js',
    '/js/database.js',
    '/js/installButton.js',
    '/js/mainChart.js',
    '/js/navigation.js',
    
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    
    '/manifest.json'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching app shell...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Fetch event - serve from cache if available, fallback to network
self.addEventListener('fetch', (event) => {
    console.log('Fetch intercepted for:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});

const CACHE_NAME = 'todo-app-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    
    '/pwa-diary/css/variables.css',
    '/pwa-diary/css/custom.css',
    '/pwa-diary/css/theme.css',
    
    '/pwa-diary/js/calendar.js',
    '/pwa-diary/js/customization.js',
    '/pwa-diary/js/database.js',
    '/pwa-diary/js/installButton.js',
    '/pwa-diary/js/mainChart.js',
    '/pwa-diary/js/navigation.js',
    
    '/pwa-diary/icons/icon-192x192.png',
    '/pwa-diary/icons/icon-512x512.png',
    
    '/pwa-diary/manifest.json'
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

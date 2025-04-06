const CACHE_NAME = 'moodflow-2025v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',

    './css/variables.css',
    './css/custom.css',
    './css/theme.css',
    
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    
    './js/calendar.js',
    './js/customization.js',
    './js/database.js',
    './js/installButton.js',
    './js/mainChart.js',
    './js/navigation.js',

    './svg/instagram.svg',
    './svg/linkedin.svg',
    './svg/logo.svg',
    './svg/reddit.svg',
    './svg/youtube.svg'
];

// Install event - cache app shell
/*self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching app shell...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});*/
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function (cache) {
            console.log('Caching files...');
            return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, {
                    cache: "reload"
                })))
                .catch(err => console.log('Cache error:', err));
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
/*self.addEventListener('fetch', (event) => {
    console.log('Fetch intercepted for:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});*/
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            return response || fetch(event.request);
        })
    );
});

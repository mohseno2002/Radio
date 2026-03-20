const CACHE = 'radio-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // don't intercept radio streams
    const url = e.request.url;
    if (url.includes('api.radio-browser') || url.includes('.mp3') || url.includes('.m3u8') || url.includes('stream')) {
        return;
    }
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});

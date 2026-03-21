const CACHE = 'radio-v6';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => {
            self.clients.claim();
            // أبلغ كل النوافذ المفتوحة بوجود تحديث
            self.clients.matchAll({ type: 'window' }).then(clients => {
                clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
            });
        })
    );
});

self.addEventListener('fetch', e => {
    const url = e.request.url;
    // لا تعترض روابط البث
    if (url.includes('api.radio-browser') || url.includes('.mp3') || url.includes('.m3u8') || url.includes('stream')) {
        return;
    }
    e.respondWith(
        // Network first للـ index.html عشان يحس بالتحديث
        url.includes('index.html') || url.endsWith('/')
            ? fetch(e.request).then(res => {
                const clone = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone));
                return res;
              }).catch(() => caches.match(e.request))
            : caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});

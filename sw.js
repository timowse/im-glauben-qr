// Service Worker – ImGlauben Kiosk
// Caches the app shell for offline / faster startup
const CACHE = 'imglaube-kiosk-v1';
const PRECACHE = [
  '/im-glauben-qr/',
  '/im-glauben-qr/index.html',
  '/im-glauben-qr/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first for CDN images (always fresh), cache-first for app shell
  const url = new URL(e.request.url);
  if (url.hostname.includes('shopify') || url.hostname.includes('googleapis') || url.hostname.includes('jsdelivr')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});

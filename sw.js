// Service Worker – ImGlauben Kiosk
// Auto-update: neue Version wird sofort aktiviert ohne manuellen Reload
const CACHE = 'imglaube-kiosk-v2';
const PRECACHE = [
  '/im-glauben-qr/',
  '/im-glauben-qr/index.html',
  '/im-glauben-qr/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  );
  // Sofort aktivieren – nicht auf Tab-Schließen warten
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Netzwerk zuerst für alle Requests – damit Updates immer ankommen
  // Fallback auf Cache nur wenn offline
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Erfolgreiche Antwort auch im Cache speichern
        if (response.ok && e.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

/* 90-Day Career OS service worker — offline shell + fast static assets. */
const VERSION = 'careeros-v1';
const CORE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
];

const isLocalhost = ['localhost', '127.0.0.1'].includes(self.location.hostname);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Never intercept cross-origin requests (fonts, analytics, ...).
  if (!sameOrigin) return;

  // In development, stay out of the way of Vite HMR — don't intercept dev-server internals.
  if (
    isLocalhost &&
    (url.pathname.startsWith('/@') ||
      url.pathname.includes('/node_modules') ||
      url.pathname.includes('/.vite/') ||
      url.pathname.includes('/__vite'))
  ) {
    return;
  }

  // Static, content-hashed assets: cache-first (they never change per URL).
  const isHashedAsset = url.pathname.startsWith('/assets/');
  if (isHashedAsset) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Navigations & everything else: network-first with cache fallback (offline support).
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => (await caches.match(req)) || (await caches.match('/'))),
  );
});

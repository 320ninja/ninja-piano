// Offline cache: app shell first, then every song file.
const CACHE = 'ninja-piano-v1';
const SONG_FILES = ['kids', 'classical', 'pop', 'folk', 'holiday', 'hymns', 'jazz', 'blues', 'blues-patterns', 'rock', 'edm', 'fingerstyle', 'hard', 'jazz-hard', 'blues-hard', 'exercises'];
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'assets/app.css', 'vendor/vexflow.js',
  'js/app.js', 'js/music.js', 'js/score.js', 'js/audio.js', 'js/keyboard.js', 'js/themes.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png',
  ...SONG_FILES.map((f) => `songs/${f}.json`),
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Network first so new songs show up, falling back to the cache when offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});

// sw.js — Service Worker Radar Alert TN
const CACHE = 'radar-alert-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/alert.mp3',
];

// Installation : mise en cache des ressources statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : cache-first pour les assets, network-first pour Firebase
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Toujours réseau pour Firebase
  if (url.includes('firestore.googleapis.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {
      headers: { 'Content-Type': 'application/json' }
    })));
    return;
  }

  // Cache-first pour les assets locaux
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

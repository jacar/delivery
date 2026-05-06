// Service Worker Desactivado para evitar errores de red y cache corrupto
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// NO añadir listener de 'fetch' si no se va a responder nada.
// Esto evita el error: "The FetchEvent resulted in a network error response: the promise was rejected"

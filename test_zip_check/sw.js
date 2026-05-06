// Service Worker Bypass - Desactivado para depuración
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', (event) => {
  // No hacer nada, dejar que todas las peticiones sigan su curso normal
  return;
});

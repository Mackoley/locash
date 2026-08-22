// LOCASH Service Worker - Network First with PWA WebAPK Support
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy with offline fallback to satisfy Chrome PWA WebAPK criteria
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Push notification listener
self.addEventListener('push', (event) => {
  let data = { title: '🏢 LOCASH - Novo Contato!', body: 'Você recebeu uma nova mensagem ou solicitação.' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const notifTitle = data.title || '🏢 LOCASH - Notificação';
  const notifOptions = {
    body: data.body || 'Atualização na sua central de locação.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [300, 150, 300, 150, 300],
    tag: `locash-push-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(notifTitle, notifOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

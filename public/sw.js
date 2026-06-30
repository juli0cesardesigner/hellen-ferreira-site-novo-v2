self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Novo Agendamento!';
    const options = {
      body: data.body || 'Você tem um novo ensaio confirmado.',
      icon: data.icon || '/brand/favicon.svg',
      badge: data.badge || '/brand/favicon.svg',
      data: {
        url: data.url || '/admin'
      },
      vibrate: [100, 50, 100],
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Erro ao processar evento de push no Service Worker:', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        if (clientUrl.pathname.startsWith('/admin') && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Custom service worker code for push notifications
// This will be injected into the generated service worker

// Handle push events
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Story App',
    body: 'Ada cerita baru yang dibagikan!',
    icon: '/images/icons/android-launchericon-192-192.png',
    badge: '/images/icons/android-launchericon-192-192.png',
    tag: 'story-notification',
    data: {
      url: '/#/stories'
    }
  };

  // If event has data, use it for dynamic notification
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        data: {
          url: data.url || notificationData.data.url,
          storyId: data.storyId || null
        }
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
      // Use default notification data
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: 'view',
          title: 'Lihat Cerita',
          icon: '/images/icons/android-launchericon-192-192.png'
        },
        {
          action: 'dismiss',
          title: 'Tutup'
        }
      ],
      requireInteraction: false,
      vibrate: [200, 100, 200]
    }
  );

  event.waitUntil(promiseChain);
});

// Handle notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received:', event);
  
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Default action or 'view' action - navigate to the URL
  const urlToOpen = notificationData?.url || '/#/stories';
  
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then(function(windowClients) {
    // Check if there's already a window/tab open with the target URL
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }
    
    // If no existing window, open a new one
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});


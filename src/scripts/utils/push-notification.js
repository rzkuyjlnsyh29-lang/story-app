import ApiService from '../data/api';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushNotification = {
  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      this._registration = registration;
    } catch (error) {
      console.error('Service worker not ready:', error);
    }
  },

  async subscribe() {
    if (!this._registration) {
      console.error('Service worker registration not found.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted.');
      return null;
    }

    try {
      const subscription = await this._registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('Push subscription successful:', subscription);
      
      // Send subscription to the server
      try {
        const result = await ApiService.subscribePush(subscription);
        if (result.error) {
          console.error('Failed to send subscription to server:', result.message);
        }
      } catch (error) {
        console.error('Error sending subscription to server:', error);
      }
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      return null;
    }
  },

  async isSubscribed() {
    if (!this._registration) {
      return false;
    }

    const subscription = await this._registration.pushManager.getSubscription();
    return subscription !== null;
  },

  async unsubscribe() {
    if (!this._registration) {
      return false;
    }

    try {
      const subscription = await this._registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        try {
          await ApiService.unsubscribePush();
        } catch (error) {
          console.error('Error notifying server of unsubscribe:', error);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  },
};

export default PushNotification;

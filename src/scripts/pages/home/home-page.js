// src/scripts/pages/home/home-page.js
import Auth from '../../utils/auth';
import PushNotification from '../../utils/push-notification';

export default class HomePage {
  async render() {
    const isLoggedIn = Auth.isLoggedIn();
    const user = Auth.getUserData();
  
    return `
 <section class="container" id="main-content-section" tabindex="-1">
        <div class="hero-section">
          <h1 tabindex="0">Selamat Datang di Story App</h1>
          <p tabindex="0">Berbagi cerita dan pengalaman menarik seputar Dicoding</p>
          
          ${isLoggedIn ? `
            <div class="user-welcome">
              <h2>Halo, <strong>${user.name}</strong>!</h2>
              <div class="action-buttons">
                <a href="#/stories" class="btn-primary">Lihat Stories</a>
                <a href="#/add-story" class="btn-secondary">Tambah Story</a>
                <a href="#/map" class="btn-secondary">Lihat Peta</a>
                <div class="push-notification-toggle">
                  <label class="toggle-switch">
                    <input type="checkbox" id="pushNotificationToggle" aria-label="Aktifkan notifikasi push">
                    <span class="toggle-label">Notifikasi Push</span>
                  </label>
                </div>
                <button id="logoutBtn" class="btn-outline">Logout</button>
              </div>
            </div>
          ` : `
            <div class="guest-welcome">
              <h2>Mulai Berbagi Cerita</h2>
              <div class="action-buttons">
                <a href="#/login" class="btn-primary">Login</a>
                <a href="#/register" class="btn-secondary">Daftar</a>
                <a href="#/stories" class="btn-outline">Lihat sebagai Guest</a>
              </div>
            </div>
          `}
        </div>
  
        <div class="features">
          <h2>Fitur Unggulan</h2>
          <div class="feature-grid">
            <div class="feature-card">
              <h3>📝 Berbagi Cerita</h3>
              <p>Bagikan pengalaman dan cerita menarik seputar Dicoding</p>
            </div>
            <div class="feature-card">
              <h3>🗺️ Peta Interaktif</h3>
              <p>Lihat lokasi cerita di peta dengan multiple layer</p>
            </div>
            <div class="feature-card">
              <h3>📱 Responsif</h3>
              <p>Akses dari berbagai perangkat dengan tampilan optimal</p>
            </div>
            <div class="feature-card">
              <h3>♿ Aksesibilitas</h3>
              <p>Didesain untuk semua pengguna termasuk difabel</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Auth.logout();
        window.location.hash = '#/';
      });
    }

    // Initialize push notifications if logged in
    if (Auth.isLoggedIn()) {
      await this.initPushNotifications();
    }

    // Skip to content functionality
    this.setupSkipToContent();
  }

  async initPushNotifications() {
    try {
      await PushNotification.init();
      
      const toggle = document.getElementById('pushNotificationToggle');
      if (!toggle) return;

      // Check current subscription status
      const isSubscribed = await PushNotification.isSubscribed();
      toggle.checked = isSubscribed;

      // Handle toggle change
      toggle.addEventListener('change', async (e) => {
        const isChecked = e.target.checked;
        
        if (isChecked) {
          // Subscribe
          const subscription = await PushNotification.subscribe();
          if (subscription) {
            console.log('Push notification enabled');
            this.showMessage('Notifikasi push diaktifkan', 'success');
          } else {
            toggle.checked = false;
            this.showMessage('Gagal mengaktifkan notifikasi push', 'error');
          }
        } else {
          // Unsubscribe
          const unsubscribed = await PushNotification.unsubscribe();
          if (unsubscribed) {
            console.log('Push notification disabled');
            this.showMessage('Notifikasi push dinonaktifkan', 'success');
          } else {
            toggle.checked = true;
            this.showMessage('Gagal menonaktifkan notifikasi push', 'error');
          }
        }
      });
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  showMessage(message, type) {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '12px 24px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
    messageDiv.style.color = 'white';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  setupSkipToContent() {
    const mainContent = document.getElementById('main-content-section');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.setAttribute('role', 'main');
    }
  }
}
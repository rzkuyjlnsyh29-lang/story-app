// src/scripts/pages/login/login-page.js
import ApiService from '../../data/api';
import Auth from '../../utils/auth';

export default class LoginPage {
  async render() {
    return `
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="login-form">
          <h1 tabindex="0">Login</h1>
          <form id="loginForm">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                aria-required="true"
                autocomplete="email"
              >
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required
                aria-required="true"
                autocomplete="current-password"
                minlength="8"
              >
            </div>
            <button type="submit" class="btn-primary">Login</button>
          </form>
          <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
          <div id="message" class="message" aria-live="polite"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const email = formData.get('email');
      const password = formData.get('password');

      // Validasi
      if (!email || !password) {
        this.showMessage('Email dan password harus diisi', 'error');
        return;
      }

      if (password.length < 8) {
        this.showMessage('Password minimal 8 karakter', 'error');
        return;
      }

      try {
        const result = await ApiService.login({ email, password });
        
        if (!result.error) {
          Auth.setToken(result.loginResult.token);
          Auth.setUserData(result.loginResult);
          this.showMessage('Login berhasil!', 'success');
          setTimeout(() => {
            window.location.hash = '#/stories';
          }, 1000);
        } else {
          this.showMessage(result.message, 'error');
        }
      } catch (error) {
        this.showMessage('Terjadi kesalahan saat login', 'error');
      }
    });

    // Keyboard navigation
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.location.hash = '#/';
      }
    });
  }

  showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.setAttribute('aria-live', 'assertive');
  }
}
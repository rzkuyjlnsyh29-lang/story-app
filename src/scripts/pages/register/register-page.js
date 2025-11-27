// src/scripts/pages/register/register-page.js
import ApiService from '../../data/api';

export default class RegisterPage {
  async render() {
    return `
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="register-form">
          <h1 tabindex="0">Daftar Akun</h1>
          <form id="registerForm">
            <div class="form-group">
              <label for="name">Nama</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required
                aria-required="true"
                autocomplete="name"
              >
            </div>
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
                autocomplete="new-password"
                minlength="8"
              >
              <small>Password minimal 8 karakter</small>
            </div>
            <button type="submit" class="btn-primary">Daftar</button>
          </form>
          <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
          <div id="message" class="message" aria-live="polite"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const name = formData.get('name');
      const email = formData.get('email');
      const password = formData.get('password');

      // Validasi
      if (!name || !email || !password) {
        this.showMessage('Semua field harus diisi', 'error');
        return;
      }

      if (password.length < 8) {
        this.showMessage('Password minimal 8 karakter', 'error');
        return;
      }

      try {
        const result = await ApiService.register({ name, email, password });
        
        if (!result.error) {
          this.showMessage('Pendaftaran berhasil! Silakan login.', 'success');
          setTimeout(() => {
            window.location.hash = '#/login';
          }, 2000);
        } else {
          this.showMessage(result.message, 'error');
        }
      } catch (error) {
        this.showMessage('Terjadi kesalahan saat pendaftaran', 'error');
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
// src/scripts/pages/add-story/add-story-page.js
import ApiService from '../../data/api';
import Auth from '../../utils/auth';
import CONFIG from '../../config';

export default class AddStoryPage {
  constructor() {
    this.selectedLocation = null;
    this.map = null;
    this.photoFile = null;
  }

  async render() {
    const isLoggedIn = Auth.isLoggedIn();
    
    if (!isLoggedIn) {
      return `
        <section class="container" id="main-content-section">
          <div class="auth-required">
            <h2>Login Diperlukan</h2>
            <p>Anda harus login untuk menambahkan cerita.</p>
            <a href="#/login" class="btn-primary">Login</a>
          </div>
        </section>
      `;
    }

    return `
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="page-header">
          <h1 tabindex="0">Tambah Cerita Baru</h1>
        </div>

        <form id="addStoryForm" class="add-story-form">
          <div class="form-section">
            <h2>Foto Cerita</h2>
            
            <div class="photo-upload">
              <div class="photo-preview-container">
                <img id="photoPreview" src="" alt="Preview foto" style="display: none;">
                <div id="photoPlaceholder" class="photo-placeholder">
                  <span>Belum ada foto</span>
                </div>
              </div>
              
              <div class="photo-actions">
                <label for="photoInput" class="btn-secondary">
                  📁 Pilih dari File
                </label>
                <button type="button" id="cameraBtn" class="btn-secondary">
                  📷 Ambil dari Kamera
                </button>
                <input 
                  type="file" 
                  id="photoInput" 
                  accept="image/*" 
                  style="display: none;"
                  aria-label="Pilih foto dari file"
                >
              </div>
              <div id="photoError" class="error-message" aria-live="polite"></div>
            </div>
          </div>

          <div class="form-section">
            <h2>Deskripsi Cerita</h2>
            <div class="form-group">
              <label for="description">Deskripsi *</label>
              <textarea 
                id="description" 
                name="description" 
                required
                aria-required="true"
                placeholder="Ceritakan pengalaman atau cerita menarik Anda..."
                rows="4"
              ></textarea>
              <div id="descriptionError" class="error-message" aria-live="polite"></div>
            </div>
          </div>

          <div class="form-section">
            <h2>Lokasi (Opsional)</h2>
            <p>Klik pada peta untuk memilih lokasi</p>
            
            <div id="locationMap" class="location-map">
              <div class="map-loading">Memuat peta...</div>
            </div>
            
            <div class="location-info">
              <div id="locationStatus">Belum memilih lokasi</div>
              <button type="button" id="clearLocationBtn" class="btn-outline" style="display: none;">
                Hapus Lokasi
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" id="submitBtn">
              Publikasikan Cerita
            </button>
            <a href="#/stories" class="btn-outline">Batal</a>
          </div>

          <div id="formMessage" class="message" aria-live="polite"></div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    if (!Auth.isLoggedIn()) return;

    await this.initMap();
    this.setupEventListeners();
    this.setupSkipToContent();
  }

  async initMap() {
    // Load Leaflet if not already loaded
    if (typeof L === 'undefined') {
      await this.loadLeaflet();
    }

    // Initialize map for location selection
    this.map = L.map('locationMap').setView([-6.2, 106.8], 10);
    
    L.tileLayer(CONFIG.MAP_TILE_LAYERS.osm, {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    // Add click event to select location (CRITERIA 3 - Basic: Select lat/long via map click)
    this.map.on('click', (e) => {
      this.selectLocation(e.latlng);
    });

    // Remove loading
    document.querySelector('#locationMap .map-loading').style.display = 'none';
  }

  async loadLeaflet() {
    return new Promise((resolve) => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  selectLocation(latlng) {
    this.selectedLocation = latlng;
    
    // Clear existing marker
    if (this.locationMarker) {
      this.map.removeLayer(this.locationMarker);
    }
    
    // Add new marker
    this.locationMarker = L.marker(latlng)
      .addTo(this.map)
      .bindPopup('Lokasi terpilih')
      .openPopup();

    // Update UI
    document.getElementById('locationStatus').textContent = 
      `Lokasi terpilih: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
    document.getElementById('clearLocationBtn').style.display = 'block';
  }

  setupEventListeners() {
    // File input
    document.getElementById('photoInput').addEventListener('change', (e) => {
      this.handlePhotoSelect(e.target.files[0]);
    });

    // Camera button (CRITERIA 3 - Advance: Camera capture)
    document.getElementById('cameraBtn').addEventListener('click', () => {
      this.openCamera();
    });

    // Clear location
    document.getElementById('clearLocationBtn').addEventListener('click', () => {
      this.clearLocation();
    });

    // Form submission
    document.getElementById('addStoryForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitForm();
    });

    // Input validation
    document.getElementById('description').addEventListener('input', () => {
      this.validateDescription();
    });
  }

  handlePhotoSelect(file) {
    if (!file) return;

    // Validate file (CRITERIA 3 - Skilled: Input validation)
    if (!file.type.startsWith('image/')) {
      this.showPhotoError('File harus berupa gambar');
      return;
    }

    if (file.size > 1 * 1024 * 1024) { // 1MB
      this.showPhotoError('Ukuran file maksimal 1MB');
      return;
    }

    this.photoFile = file;
    this.showPhotoError(''); // Clear error

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('photoPreview');
      const placeholder = document.getElementById('photoPlaceholder');
      
      preview.src = e.target.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  async openCamera() {
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.showPhotoError('Kamera tidak didukung di browser ini');
        return;
      }

      // Access camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });

      // Create camera modal
      this.showCameraModal(stream);
    } catch (error) {
      this.showPhotoError('Tidak dapat mengakses kamera: ' + error.message);
    }
  }

  showCameraModal(stream) {
    const modal = document.createElement('div');
    modal.className = 'camera-modal';
    modal.innerHTML = `
      <div class="camera-modal-content">
        <h3>Ambil Foto</h3>
        <video id="cameraVideo" autoplay playsinline></video>
        <div class="camera-actions">
          <button id="captureBtn" class="btn-primary">Ambil Foto</button>
          <button id="closeCameraBtn" class="btn-outline">Tutup</button>
        </div>
        <canvas id="cameraCanvas" style="display: none;"></canvas>
      </div>
    `;

    document.body.appendChild(modal);

    const video = document.getElementById('cameraVideo');
    video.srcObject = stream;

    // Capture button
    document.getElementById('captureBtn').addEventListener('click', () => {
      this.capturePhoto(video, stream);
    });

    // Close button
    document.getElementById('closeCameraBtn').addEventListener('click', () => {
      this.closeCamera(stream, modal);
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeCamera(stream, modal);
      }
    });
  }

  capturePhoto(video, stream) {
    const canvas = document.getElementById('cameraCanvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    // Convert to blob
    canvas.toBlob((blob) => {
      this.handlePhotoSelect(blob);
      this.closeCamera(stream, document.querySelector('.camera-modal'));
    }, 'image/jpeg', 0.8);
  }

  closeCamera(stream, modal) {
    // Stop media stream (CRITERIA 3 - Advance: Close media stream)
    stream.getTracks().forEach(track => track.stop());
    
    if (modal) {
      modal.remove();
    }
  }

  clearLocation() {
    this.selectedLocation = null;
    
    if (this.locationMarker) {
      this.map.removeLayer(this.locationMarker);
      this.locationMarker = null;
    }
    
    document.getElementById('locationStatus').textContent = 'Belum memilih lokasi';
    document.getElementById('clearLocationBtn').style.display = 'none';
  }

  validateDescription() {
    const description = document.getElementById('description').value;
    const errorElement = document.getElementById('descriptionError');
    
    if (!description.trim()) {
      errorElement.textContent = 'Deskripsi harus diisi';
      return false;
    }
    
    errorElement.textContent = '';
    return true;
  }

  showPhotoError(message) {
    document.getElementById('photoError').textContent = message;
  }

  async submitForm() {
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('formMessage');
    
    // Validation
    if (!this.validateDescription()) {
      this.showMessage('Harap perbaiki error di form', 'error', messageDiv);
      return;
    }

    if (!this.photoFile) {
      this.showPhotoError('Foto harus diisi');
      this.showMessage('Foto harus diisi', 'error', messageDiv);
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Mempublikasikan...';

      const formData = new FormData();
      formData.append('description', document.getElementById('description').value);
      formData.append('photo', this.photoFile);
      
      if (this.selectedLocation) {
        formData.append('lat', this.selectedLocation.lat);
        formData.append('lon', this.selectedLocation.lng);
      }

      const result = await ApiService.addStory(formData);
      
      if (!result.error) {
        this.showMessage('Cerita berhasil dipublikasikan!', 'success', messageDiv);
        this.resetForm();
        
        setTimeout(() => {
          window.location.hash = '#/stories';
        }, 2000);
      } else {
        this.showMessage(result.message, 'error', messageDiv);
      }
    } catch (error) {
      this.showMessage('Terjadi kesalahan: ' + error.message, 'error', messageDiv);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Publikasikan Cerita';
    }
  }

  resetForm() {
    document.getElementById('addStoryForm').reset();
    this.photoFile = null;
    this.clearLocation();
    
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPlaceholder').style.display = 'block';
  }

  showMessage(message, type, element) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.setAttribute('aria-live', 'assertive');
  }

  setupSkipToContent() {
    const mainContent = document.getElementById('main-content-section');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
    }
  }
}
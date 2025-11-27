// src/scripts/pages/stories/stories-page.js
import ApiService from '../../data/api';
import Auth from '../../utils/auth';
import IndexedDBService from '../../utils/indexeddb';

export default class StoriesPage {
  constructor() {
    this.stories = [];
    this.currentPage = 1;
  }

  async render() {
    const isLoggedIn = Auth.isLoggedIn();
      
    return `
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="page-header">
          <h1 tabindex="0">Semua Cerita</h1>
          <div class="page-actions">
            <a href="#/map" class="btn-secondary">Lihat di Peta</a>
            ${isLoggedIn ? `<a href="#/add-story" class="btn-primary">Tambah Story</a>` : ''}
          </div>
        </div>
  
        <!-- FIX: Tambah h2 untuk hierarchy yang proper -->
        <h2 class="visually-hidden">Daftar cerita terbaru</h2>
  
        <div class="stories-container">
          <div id="storiesList" class="stories-grid" role="list" aria-label="Daftar cerita">
            <div class="loading">Memuat cerita...</div>
          </div>
          <div class="load-more-container">
            <button id="loadMoreBtn" class="btn-outline" style="display: none;">Muat Lebih Banyak</button>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.loadStories();
    this.setupEventListeners();
    this.setupSkipToContent();
  }

  async loadStories() {
    try {
      const storiesList = document.getElementById('storiesList');
      storiesList.innerHTML = '<div class="loading">Memuat cerita...</div>';

      const result = await ApiService.getStories(this.currentPage, 10);
      
      if (!result.error) {
        this.stories = result.listStory;
        this.displayStories();
        
        // Show/hide load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (result.listStory.length === 10) {
          loadMoreBtn.style.display = 'block';
        } else {
          loadMoreBtn.style.display = 'none';
        }
      } else {
        this.showError('Gagal memuat cerita');
      }
    } catch (error) {
      this.showError('Terjadi kesalahan saat memuat cerita');
    }
  }

  displayStories() {
    const storiesList = document.getElementById('storiesList');
    
    if (this.stories.length === 0) {
      storiesList.innerHTML = '<div class="no-stories">Belum ada cerita yang dibagikan.</div>';
      return;
    }
  
    storiesList.innerHTML = this.stories.map(story => `
      <article class="story-card" role="listitem">
        <div class="story-image">
          <img 
            src="${story.photoUrl}" 
            alt="${story.description}" 
            loading="lazy"
          >
          ${story.lat && story.lon ? `
            <div class="story-location-badge" title="Memiliki lokasi">
              📍
            </div>
          ` : ''}
        </div>
        <div class="story-content">
          <!-- FIX: ganti h3 jadi h2 untuk hierarchy yang benar -->
          <h2 class="story-title">${story.name}</h2>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <time datetime="${story.createdAt}">
              ${new Date(story.createdAt).toLocaleDateString('id-ID')}
            </time>
            ${story.lat && story.lon ? `
              <button 
                class="btn-location" 
                data-lat="${story.lat}" 
                data-lon="${story.lon}"
                aria-label="Lihat lokasi di peta"
              >
                Lihat Lokasi
              </button>
            ` : ''}
            <button 
              class="btn-outline save-story-btn" 
              data-story-id="${story.id}"
              aria-label="Simpan cerita untuk offline"
              title="Simpan untuk akses offline"
            >
              💾 Simpan
            </button>
          </div>
        </div>
      </article>
    `).join('');
  
    // Add event listeners for location buttons - FIXED URL
    storiesList.querySelectorAll('.btn-location').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lat = e.target.dataset.lat;
        const lon = e.target.dataset.lon;
        // FIX: Use proper URL format without extra path
        window.location.hash = `#/map?lat=${lat}&lon=${lon}`;
      });
    });

    // Add event listeners for save buttons
    storiesList.querySelectorAll('.save-story-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const storyId = e.target.dataset.storyId;
        const story = this.stories.find(s => s.id === storyId);
        if (story) {
          await this.saveStoryToIndexedDB(story);
        }
      });
    });
  }

  async saveStoryToIndexedDB(story) {
    try {
      await IndexedDBService.init();
      
      // Check if story already exists
      const existing = await IndexedDBService.getStory(story.id);
      if (existing) {
        this.showMessage('Cerita sudah tersimpan', 'info');
        return;
      }

      // Save story
      await IndexedDBService.addStory({
        ...story,
        synced: true // Already from server
      });

      this.showMessage('Cerita berhasil disimpan untuk akses offline', 'success');
    } catch (error) {
      console.error('Error saving story to IndexedDB:', error);
      this.showMessage('Gagal menyimpan cerita', 'error');
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
    messageDiv.style.backgroundColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    messageDiv.style.color = 'white';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  setupEventListeners() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', async () => {
        this.currentPage++;
        await this.loadMoreStories();
      });
    }
  }

  async loadMoreStories() {
    try {
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      loadMoreBtn.textContent = 'Memuat...';
      loadMoreBtn.disabled = true;

      const result = await ApiService.getStories(this.currentPage, 10);
      
      if (!result.error) {
        this.stories = [...this.stories, ...result.listStory];
        this.displayStories();
        
        if (result.listStory.length < 10) {
          loadMoreBtn.style.display = 'none';
        }
      }
    } catch (error) {
      this.showError('Gagal memuat lebih banyak cerita');
    } finally {
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      loadMoreBtn.textContent = 'Muat Lebih Banyak';
      loadMoreBtn.disabled = false;
    }
  }

  showError(message) {
    const storiesList = document.getElementById('storiesList');
    storiesList.innerHTML = `<div class="error-message">${message}</div>`;
  }

  setupSkipToContent() {
    const mainContent = document.getElementById('main-content-section');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
    }
  }
}
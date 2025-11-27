// src/scripts/pages/offline-stories/offline-stories-page.js
import IndexedDBService from '../../utils/indexeddb';
import ApiService from '../../data/api';
import Auth from '../../utils/auth';

export default class OfflineStoriesPage {
  constructor() {
    this.stories = [];
    this.filteredStories = [];
    this.currentSort = { field: 'createdAt', order: 'desc' };
    this.currentFilter = { synced: undefined };
    this.searchQuery = '';
  }

  async render() {
    return `
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="page-header">
          <h1 tabindex="0">Cerita Offline</h1>
          <p>Kelola cerita yang disimpan untuk akses offline</p>
        </div>

        <div class="offline-stories-controls">
          <div class="controls-row">
            <div class="search-box">
              <input 
                type="text" 
                id="searchInput" 
                placeholder="Cari cerita..." 
                aria-label="Cari cerita"
              >
              <button id="searchBtn" class="btn-secondary" aria-label="Cari">🔍</button>
            </div>
            
            <div class="filter-controls">
              <select id="filterSelect" aria-label="Filter cerita">
                <option value="all">Semua Cerita</option>
                <option value="synced">Sudah Disinkronkan</option>
                <option value="unsynced">Belum Disinkronkan</option>
              </select>
            </div>

            <div class="sort-controls">
              <select id="sortField" aria-label="Urutkan berdasarkan">
                <option value="createdAt">Tanggal</option>
                <option value="name">Nama</option>
                <option value="description">Deskripsi</option>
              </select>
              <select id="sortOrder" aria-label="Urutan">
                <option value="desc">Terbaru</option>
                <option value="asc">Terlama</option>
              </select>
            </div>
          </div>

          <div class="sync-controls">
            <button id="syncBtn" class="btn-primary" aria-label="Sinkronkan cerita offline">
              🔄 Sinkronkan ke Server
            </button>
            <button id="saveCurrentBtn" class="btn-secondary" aria-label="Simpan cerita saat ini">
              💾 Simpan Cerita Saat Ini
            </button>
          </div>
        </div>

        <div class="offline-stories-container">
          <div id="offlineStoriesList" class="stories-grid" role="list" aria-label="Daftar cerita offline">
            <div class="loading">Memuat cerita offline...</div>
          </div>
        </div>

        <div id="message" class="message" aria-live="polite"></div>
      </section>
    `;
  }

  async afterRender() {
    await IndexedDBService.init();
    await this.loadStories();
    this.setupEventListeners();
    this.setupSkipToContent();
  }

  async loadStories() {
    try {
      this.stories = await IndexedDBService.getAllStories();
      this.applyFiltersAndSort();
      this.displayStories();
    } catch (error) {
      console.error('Error loading offline stories:', error);
      this.showMessage('Gagal memuat cerita offline', 'error');
    }
  }

  applyFiltersAndSort() {
    let filtered = [...this.stories];

    // Apply search
    if (this.searchQuery) {
      filtered = filtered.filter(story => {
        const nameMatch = story.name?.toLowerCase().includes(this.searchQuery.toLowerCase());
        const descMatch = story.description?.toLowerCase().includes(this.searchQuery.toLowerCase());
        return nameMatch || descMatch;
      });
    }

    // Apply filter
    if (this.currentFilter.synced !== undefined) {
      filtered = filtered.filter(story => story.synced === this.currentFilter.synced);
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aValue = a[this.currentSort.field];
      let bValue = b[this.currentSort.field];

      if (this.currentSort.field === 'createdAt' || this.currentSort.field === 'savedAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (this.currentSort.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredStories = filtered;
  }

  displayStories() {
    const storiesList = document.getElementById('offlineStoriesList');

    if (this.filteredStories.length === 0) {
      storiesList.innerHTML = '<div class="no-stories">Tidak ada cerita offline yang tersimpan.</div>';
      return;
    }

    storiesList.innerHTML = this.filteredStories.map(story => `
      <article class="story-card" role="listitem">
        <div class="story-image">
          <img 
            src="${story.photoUrl || '/images/logo.png'}" 
            alt="${story.description || 'Story image'}" 
            loading="lazy"
            onerror="this.src='/images/logo.png'"
          >
          ${story.synced ? `
            <div class="story-sync-badge synced" title="Sudah disinkronkan">✓</div>
          ` : `
            <div class="story-sync-badge unsynced" title="Belum disinkronkan">⚠</div>
          `}
        </div>
        <div class="story-content">
          <h2 class="story-title">${story.name || 'Tanpa Nama'}</h2>
          <p class="story-description">${story.description || ''}</p>
          <div class="story-meta">
            <time datetime="${story.createdAt || story.savedAt}">
              ${new Date(story.createdAt || story.savedAt).toLocaleDateString('id-ID')}
            </time>
            <button 
              class="btn-outline delete-story-btn" 
              data-id="${story.id || story._id || 'unknown'}"
              aria-label="Hapus cerita"
            >
              🗑️ Hapus
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Add delete event listeners
    storiesList.querySelectorAll('.delete-story-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await this.deleteStory(id);
      });
    });
  }

  async deleteStory(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus cerita ini?')) {
      return;
    }

    try {
      await IndexedDBService.deleteStory(id);
      this.showMessage('Cerita berhasil dihapus', 'success');
      await this.loadStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      this.showMessage('Gagal menghapus cerita', 'error');
    }
  }

  async saveCurrentStories() {
    if (!Auth.isLoggedIn()) {
      this.showMessage('Anda harus login untuk menyimpan cerita', 'error');
      return;
    }

    try {
      // Get current stories from API
      const result = await ApiService.getStories(1, 50);
      
      if (result.error) {
        this.showMessage('Gagal memuat cerita dari server', 'error');
        return;
      }

      // Save each story to IndexedDB
      let savedCount = 0;
      for (const story of result.listStory) {
        try {
      // Check if story already exists
      try {
        const existing = await IndexedDBService.getStory(story.id);
        if (!existing) {
          await IndexedDBService.addStory({
            ...story,
            synced: true // Already from server, so synced
          });
          savedCount++;
        }
      } catch (error) {
        // Story might not exist, try to add it
        try {
          await IndexedDBService.addStory({
            ...story,
            synced: true
          });
          savedCount++;
        } catch (addError) {
          console.error('Error adding story:', addError);
        }
      }
        } catch (error) {
          console.error('Error saving story:', error);
        }
      }

      this.showMessage(`Berhasil menyimpan ${savedCount} cerita`, 'success');
      await this.loadStories();
    } catch (error) {
      console.error('Error saving current stories:', error);
      this.showMessage('Gagal menyimpan cerita', 'error');
    }
  }

  async syncOfflineStories() {
    if (!Auth.isLoggedIn()) {
      this.showMessage('Anda harus login untuk sinkronisasi', 'error');
      return;
    }

    try {
      const unsyncedStories = await IndexedDBService.getUnsyncedStories();
      
      if (unsyncedStories.length === 0) {
        this.showMessage('Tidak ada cerita yang perlu disinkronkan', 'success');
        return;
      }

      this.showMessage(`Menyinkronkan ${unsyncedStories.length} cerita...`, 'info');

      let syncedCount = 0;
      let failedCount = 0;

      for (const story of unsyncedStories) {
        try {
          // Create FormData for the story
          const formData = new FormData();
          formData.append('description', story.description || '');
          
          // If we have photo data, add it
          if (story.photoUrl) {
            // Try to fetch the image and convert to blob
            try {
              const response = await fetch(story.photoUrl);
              const blob = await response.blob();
              formData.append('photo', blob, 'photo.jpg');
            } catch (e) {
              console.warn('Could not fetch photo for story:', story.id);
            }
          }

          if (story.lat && story.lon) {
            formData.append('lat', story.lat);
            formData.append('lon', story.lon);
          }

          const result = await ApiService.addStory(formData);
          
          if (!result.error) {
            // Mark as synced
            await IndexedDBService.markAsSynced(story.id);
            syncedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error('Error syncing story:', error);
          failedCount++;
        }
      }

      this.showMessage(
        `Sinkronisasi selesai: ${syncedCount} berhasil, ${failedCount} gagal`,
        syncedCount > 0 ? 'success' : 'error'
      );
      
      await this.loadStories();
    } catch (error) {
      console.error('Error syncing offline stories:', error);
      this.showMessage('Gagal menyinkronkan cerita', 'error');
    }
  }

  setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.applyFiltersAndSort();
      this.displayStories();
    });

    searchBtn.addEventListener('click', () => {
      this.searchQuery = searchInput.value;
      this.applyFiltersAndSort();
      this.displayStories();
    });

    // Filter
    const filterSelect = document.getElementById('filterSelect');
    filterSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value === 'all') {
        this.currentFilter.synced = undefined;
      } else if (value === 'synced') {
        this.currentFilter.synced = true;
      } else if (value === 'unsynced') {
        this.currentFilter.synced = false;
      }
      this.applyFiltersAndSort();
      this.displayStories();
    });

    // Sort
    const sortField = document.getElementById('sortField');
    const sortOrder = document.getElementById('sortOrder');

    sortField.addEventListener('change', (e) => {
      this.currentSort.field = e.target.value;
      this.applyFiltersAndSort();
      this.displayStories();
    });

    sortOrder.addEventListener('change', (e) => {
      this.currentSort.order = e.target.value;
      this.applyFiltersAndSort();
      this.displayStories();
    });

    // Sync button
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.addEventListener('click', () => {
      this.syncOfflineStories();
    });

    // Save current button
    const saveCurrentBtn = document.getElementById('saveCurrentBtn');
    saveCurrentBtn.addEventListener('click', () => {
      this.saveCurrentStories();
    });
  }

  showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.setAttribute('aria-live', 'assertive');
    
    setTimeout(() => {
      messageDiv.textContent = '';
      messageDiv.className = 'message';
    }, 5000);
  }

  setupSkipToContent() {
    const mainContent = document.getElementById('main-content-section');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
    }
  }
}


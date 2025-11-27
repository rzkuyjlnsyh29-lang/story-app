// src/scripts/pages/map/map-page.js
import ApiService from '../../data/api';
import CONFIG from '../../config';

export default class MapPage {
  constructor() {
    this.map = null;
    this.markers = [];
    this.stories = [];
  }

  async render() {
    return `
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="page-header">
          <h1 tabindex="0">Peta Cerita</h1>
          <p>Lihat lokasi semua cerita yang dibagikan</p>
        </div>

        <div class="map-controls">
          <div class="layer-controls">
            <button id="osmLayerBtn" class="btn-layer active" data-layer="osm">
              Peta Standar
            </button>
            <button id="satelliteLayerBtn" class="btn-layer" data-layer="satellite">
              Satellite
            </button>
          </div>
          <div class="map-stats">
            <span id="mapStats">Memuat data...</span>
          </div>
        </div>

        <div id="map" class="map-container" role="application" aria-label="Peta interaktif cerita">
          <div class="map-loading">Memuat peta...</div>
        </div>

        <div class="stories-sidebar">
          <h3>Cerita di Area Ini</h3>
          <div id="storiesList" class="stories-list"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.initMap();
    await this.loadStoriesWithLocation();
    this.setupEventListeners();
    this.setupSkipToContent();
    
    // NEW: Handle query parameters for direct location
    this.handleQueryParams();
  }
  
  // NEW: Add this method to handle query parameters
  handleQueryParams() {
    const queryParams = this.getQueryParams();
    
    if (queryParams.lat && queryParams.lon) {
      const lat = parseFloat(queryParams.lat);
      const lon = parseFloat(queryParams.lon);
      
      // Fly to the specific location
      this.map.flyTo([lat, lon], 15);
      
      // Find and highlight the story at this location
      const story = this.stories.find(s => 
        Math.abs(s.lat - lat) < 0.001 && 
        Math.abs(s.lon - lon) < 0.001
      );
      
      if (story) {
        this.highlightStoryInList(story.id);
        
        // Open popup
        const marker = this.markers.find(m => 
          m.getLatLng().lat === story.lat && 
          m.getLatLng().lng === story.lon
        );
        if (marker) {
          marker.openPopup();
        }
      }
    }
  }

  getQueryParams() {
    const pathname = window.location.hash.replace('#', '') || '/';
    const queryString = pathname.split('?')[1];
    
    if (!queryString) return {};
    
    return Object.fromEntries(
      new URLSearchParams(queryString)
    );
  }

  async initMap() {
    // Load Leaflet CSS dynamically
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS dynamically
    if (typeof L === 'undefined') {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    // Initialize map
    this.map = L.map('map').setView([-6.2, 106.8], 10); // Default to Jakarta

    // Define tile layers (CRITERIA 2 - Advance: Multiple tile layers)
    this.tileLayers = {
      osm: L.tileLayer(CONFIG.MAP_TILE_LAYERS.osm, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }),
      satellite: L.tileLayer(CONFIG.MAP_TILE_LAYERS.satellite, {
        attribution: '&copy; Google Maps'
      })
    };

    // Add default layer
    this.tileLayers.osm.addTo(this.map);

    // Remove loading indicator
    document.querySelector('.map-loading').style.display = 'none';
  }

  async loadStoriesWithLocation() {
    try {
      const result = await ApiService.getStories(1, 50, true); // Get stories with location
      
      if (!result.error) {
        this.stories = result.listStory.filter(story => story.lat && story.lon);
        this.displayStoriesOnMap();
        this.updateStats();
        this.displayStoriesList();
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  }

  displayStoriesOnMap() {
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    // Add markers for each story
    this.stories.forEach(story => {
      const marker = L.marker([story.lat, story.lon])
        .addTo(this.map)
        .bindPopup(`
          <div class="map-popup">
            <img src="${story.photoUrl}" alt="${story.description}" style="width: 100px; height: 100px; object-fit: cover;">
            <h4>${story.name}</h4>
            <p>${story.description}</p>
            <small>${new Date(story.createdAt).toLocaleDateString('id-ID')}</small>
          </div>
        `);

      // Add click event to highlight in list (CRITERIA 2 - Skilled: Interactivity)
      marker.on('click', () => {
        this.highlightStoryInList(story.id);
      });

      this.markers.push(marker);
    });

    // Fit map to show all markers
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  displayStoriesList() {
    const storiesList = document.getElementById('storiesList');
    
    if (this.stories.length === 0) {
      storiesList.innerHTML = '<p>Tidak ada cerita dengan lokasi.</p>';
      return;
    }

    storiesList.innerHTML = this.stories.map(story => `
      <div class="story-list-item" data-story-id="${story.id}" tabindex="0">
        <img src="${story.photoUrl}" alt="${story.description}">
        <div class="story-info">
          <h4>${story.name}</h4>
          <p>${story.description.substring(0, 100)}...</p>
        </div>
      </div>
    `).join('');

    // Add click events to list items
    storiesList.querySelectorAll('.story-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const storyId = item.dataset.storyId;
        const story = this.stories.find(s => s.id === storyId);
        if (story) {
          this.flyToStory(story);
          this.highlightStoryInList(storyId);
        }
      });

      // Keyboard support
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const storyId = item.dataset.storyId;
          const story = this.stories.find(s => s.id === storyId);
          if (story) {
            this.flyToStory(story);
            this.highlightStoryInList(storyId);
          }
        }
      });
    });
  }

  flyToStory(story) {
    this.map.flyTo([story.lat, story.lon], 15);
    
    // Open popup
    const marker = this.markers.find(m => 
      m.getLatLng().lat === story.lat && 
      m.getLatLng().lng === story.lon
    );
    if (marker) {
      marker.openPopup();
    }
  }

  highlightStoryInList(storyId) {
    // Remove highlight from all
    document.querySelectorAll('.story-list-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add highlight to selected
    const selectedItem = document.querySelector(`[data-story-id="${storyId}"]`);
    if (selectedItem) {
      selectedItem.classList.add('active');
      selectedItem.focus();
    }
  }

  updateStats() {
    const statsElement = document.getElementById('mapStats');
    statsElement.textContent = `${this.stories.length} cerita dengan lokasi`;
  }

  setupEventListeners() {
    // Layer controls (CRITERIA 2 - Advance: Multiple tile layers)
    document.getElementById('osmLayerBtn').addEventListener('click', () => {
      this.switchLayer('osm');
      this.updateLayerButtons('osm');
    });

    document.getElementById('satelliteLayerBtn').addEventListener('click', () => {
      this.switchLayer('satellite');
      this.updateLayerButtons('satellite');
    });
  }

  switchLayer(layerName) {
    // Remove all layers
    Object.values(this.tileLayers).forEach(layer => {
      this.map.removeLayer(layer);
    });
    
    // Add selected layer
    this.tileLayers[layerName].addTo(this.map);
  }

  updateLayerButtons(activeLayer) {
    document.querySelectorAll('.btn-layer').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.layer === activeLayer);
    });
  }

  setupSkipToContent() {
    const mainContent = document.getElementById('main-content-section');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
    }
  }
}
// IndexedDB utility for offline story management
class IndexedDBService {
  constructor() {
    this.dbName = 'StoryAppDB';
    this.dbVersion = 1;
    this.storeName = 'offlineStories';
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: false
          });
          
          // Create indexes for filtering and searching
          objectStore.createIndex('name', 'name', { unique: false });
          objectStore.createIndex('description', 'description', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  }

  async addStory(story) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Mark as not synced if it's a new offline story
      const storyData = {
        ...story,
        synced: story.synced !== undefined ? story.synced : false,
        savedAt: new Date().toISOString()
      };

      const request = store.add(storyData);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to add story to IndexedDB'));
      };
    });
  }

  async getAllStories() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get stories from IndexedDB'));
      };
    });
  }

  async getStory(id) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get story from IndexedDB'));
      };
    });
  }

  async deleteStory(id) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to delete story from IndexedDB'));
      };
    });
  }

  async searchStories(query) {
    if (!this.db) {
      await this.init();
    }

    const stories = await this.getAllStories();
    const lowerQuery = query.toLowerCase();

    return stories.filter(story => {
      const nameMatch = story.name?.toLowerCase().includes(lowerQuery);
      const descMatch = story.description?.toLowerCase().includes(lowerQuery);
      return nameMatch || descMatch;
    });
  }

  async filterStories(filters) {
    if (!this.db) {
      await this.init();
    }

    const stories = await this.getAllStories();
    let filtered = [...stories];

    // Filter by synced status
    if (filters.synced !== undefined) {
      filtered = filtered.filter(story => story.synced === filters.synced);
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(story => {
        const storyDate = new Date(story.createdAt || story.savedAt);
        return storyDate >= new Date(filters.startDate);
      });
    }

    if (filters.endDate) {
      filtered = filtered.filter(story => {
        const storyDate = new Date(story.createdAt || story.savedAt);
        return storyDate <= new Date(filters.endDate);
      });
    }

    return filtered;
  }

  async sortStories(sortBy = 'createdAt', order = 'desc') {
    if (!this.db) {
      await this.init();
    }

    const stories = await this.getAllStories();

    return stories.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'createdAt' || sortBy === 'savedAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  async getUnsyncedStories() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get unsynced stories'));
      };
    });
  }

  async markAsSynced(id) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const story = getRequest.result;
        if (story) {
          story.synced = true;
          const updateRequest = store.put(story);

          updateRequest.onsuccess = () => {
            resolve(true);
          };

          updateRequest.onerror = () => {
            reject(new Error('Failed to mark story as synced'));
          };
        } else {
          reject(new Error('Story not found'));
        }
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to get story'));
      };
    });
  }

  async clearAll() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to clear IndexedDB'));
      };
    });
  }
}

export default new IndexedDBService();


// src/scripts/data/api.js
import CONFIG from '../config';
import Auth from '../utils/auth';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  PUSH_SUBSCRIBE: `${CONFIG.BASE_URL}/push/subscribe`,
};

class ApiService {
  static async register({ name, email, password }) {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  }

  static async login({ email, password }) {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async getStories(page = 1, size = 20, withLocation = false) {
    const url = new URL(ENDPOINTS.STORIES);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('location', withLocation ? 1 : 0);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${Auth.getToken()}`,
      },
    });
    return response.json();
  }

  static async addStory(formData) {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Auth.getToken()}`,
      },
      body: formData,
    });
    return response.json();
  }

  static async addStoryGuest(formData) {
    const response = await fetch(ENDPOINTS.STORIES_GUEST, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  static async subscribePush(subscription) {
    const response = await fetch(ENDPOINTS.PUSH_SUBSCRIBE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify({ subscription }),
    });
    return response.json();
  }

  static async unsubscribePush() {
    const response = await fetch(ENDPOINTS.PUSH_SUBSCRIBE, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${Auth.getToken()}`,
      },
    });
    return response.json();
  }
}

export default ApiService;
const axios = require('axios');

class ElectronApiService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'http://localhost:5000' 
      : 'http://localhost:5000';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await window.electronAPI?.store.get('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await window.electronAPI?.store.delete('authToken');
          // Redirect to login or show auth modal
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password });
    const { token } = response.data;
    await window.electronAPI?.store.set('authToken', token);
    return response.data;
  }

  async logout() {
    await window.electronAPI?.store.delete('authToken');
  }

  // Recipe methods
  async getRecipes(params = {}) {
    const response = await this.api.get('/api/recipes', { params });
    return response.data;
  }

  async getRecipe(id) {
    const response = await this.api.get(`/api/recipes/${id}`);
    return response.data;
  }

  async createRecipe(formData) {
    const response = await this.api.post('/api/recipes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Check server status
  async checkServerStatus() {
    try {
      await this.api.get('/api/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ElectronApiService;
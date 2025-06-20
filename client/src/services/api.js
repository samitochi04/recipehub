import axios from 'axios';

// Use Firebase hosting proxy in production, local in development
const baseURL = import.meta.env.PROD 
  ? '/api'  // Use Firebase hosting proxy to route to Functions
  : 'http://localhost:5000';

console.log('API Base URL:', baseURL);
console.log('Environment:', import.meta.env.PROD ? 'Production' : 'Development');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Remove this for direct Functions URL
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

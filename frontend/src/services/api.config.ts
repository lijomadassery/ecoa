import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import { useOfflineStore } from '@/store/offline';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const offlineStore = useOfflineStore();

    // Check if offline mode is enabled
    if (offlineStore.isOffline) {
      return Promise.reject(new Error('App is in offline mode'));
    }

    // Add auth token if available
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      authStore.logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api; 
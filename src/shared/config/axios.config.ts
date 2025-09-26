import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_URL = "http://localhost:30000/api";
const TOKEN_KEY = "refine-auth";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentar timeout a 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
  // Remove custom paramsSerializer to use default behavior
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging - solo para requests importantes y sin spam
    if (config.url && !config.url.includes('/attendance/today') && !config.url.includes('/users')) {
      console.log('=== AXIOS REQUEST ===');
      console.log('Method:', config.method?.toUpperCase());
      console.log('URL:', config.url);
      console.log('Params:', config.params);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      console.warn('Token expired or invalid - clearing token');
      localStorage.removeItem(TOKEN_KEY);
      // No redirigir automáticamente, dejar que la app maneje el error
      // window.location.href = '/login';
    }
    
    // Solo loggear errores importantes
    if (error.response?.status !== 401) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

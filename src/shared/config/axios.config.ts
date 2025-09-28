import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Extender el tipo de configuración para incluir metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

const API_URL = "https://api.thechildrenworld.com/api";
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
    console.log('🔍 Token from localStorage:', token ? 'Present' : 'Missing');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('🔍 No token found or no headers object');
    }
    
    // Agregar timestamp para medir tiempo de respuesta
    config.metadata = { startTime: new Date().getTime() };
    
    // Log detallado de la petición
    console.log('🚀 === AXIOS REQUEST INTERCEPTOR ===');
    console.log('📡 Method:', config.method?.toUpperCase());
    console.log('🔗 Full URL:', `${config.baseURL}${config.url}`);
    console.log('📋 Params:', config.params);
    console.log('📦 Data:', config.data);
    console.log('🔑 Headers:', config.headers);
    console.log('⏱️ Timeout:', config.timeout);
    console.log('🕐 Request Time:', new Date().toISOString());
    console.log('=====================================');
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calcular tiempo de respuesta
    const endTime = new Date().getTime();
    const responseTime = response.config.metadata?.startTime ? 
      `${endTime - response.config.metadata.startTime}ms` : 'N/A';
    
    // Log detallado de la respuesta exitosa
    console.log('✅ === AXIOS RESPONSE INTERCEPTOR (SUCCESS) ===');
    console.log('📡 Method:', response.config.method?.toUpperCase());
    console.log('🔗 URL:', response.config.url);
    console.log('📊 Status:', response.status, response.statusText);
    console.log('📦 Response Data:', response.data);
    console.log('🔑 Response Headers:', response.headers);
    console.log('⏱️ Response Time:', responseTime);
    console.log('🕐 Response Time:', new Date().toISOString());
    console.log('==============================================');
    
    return response;
  },
  (error: AxiosError) => {
    // Calcular tiempo de respuesta para errores
    const endTime = new Date().getTime();
    const responseTime = error.config?.metadata?.startTime ? 
      `${endTime - error.config.metadata.startTime}ms` : 'N/A';
    
    // Log detallado del error
    console.log('❌ === AXIOS RESPONSE INTERCEPTOR (ERROR) ===');
    console.log('📡 Method:', error.config?.method?.toUpperCase());
    console.log('🔗 URL:', error.config?.url);
    console.log('📊 Status:', error.response?.status, error.response?.statusText);
    console.log('📦 Error Response Data:', error.response?.data);
    console.log('🔑 Error Response Headers:', error.response?.headers);
    console.log('💬 Error Message:', error.message);
    console.log('🔧 Error Code:', error.code);
    console.log('⏱️ Response Time:', responseTime);
    console.log('🕐 Error Time:', new Date().toISOString());
    console.log('📋 Request Config:', {
      params: error.config?.params,
      data: error.config?.data,
      headers: error.config?.headers
    });
    console.log('============================================');
    
    // Handle common error cases
    if (error.response?.status === 401) {
      console.warn('🔐 Token expired or invalid - clearing token');
      localStorage.removeItem(TOKEN_KEY);
      // No redirigir automáticamente, dejar que la app maneje el error
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

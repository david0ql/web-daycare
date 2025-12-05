import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { notificationService } from '../services/notification.service';

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

/**
 * Interfaz para la estructura de error de NestJS
 */
interface NestJSErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string | string[];
}

/**
 * Extrae el mensaje de error del formato de NestJS
 * Maneja los 3 casos posibles de respuesta de NestJS:
 * 1. { statusCode: 404, message: "Post not found" }
 * 2. { statusCode: 404, message: "Not Found", error: "Post with id 6 not found" }
 * 3. { statusCode: 400, message: "Bad Request", error: ["password must be longer than or equal to 7 characters"] }
 */
function extractErrorMessage(errorData: any): string {
  if (!errorData) {
    return "An unknown error occurred";
  }

  // Si el errorData es una cadena, retornarla directamente
  if (typeof errorData === "string") {
    return errorData;
  }

  // Caso 1: { statusCode: 404, message: "Post not found" }
  // Si message existe y es un string, usarlo directamente
  if (errorData.message && typeof errorData.message === "string") {
    // Si message es genérico como "Not Found", "Bad Request", etc., preferir el campo error
    const genericMessages = ["Not Found", "Bad Request", "Unauthorized", "Forbidden", "Conflict", "Internal Server Error"];
    if (genericMessages.includes(errorData.message) && errorData.error) {
      // Caso 2: Preferir el campo error si message es genérico
      if (Array.isArray(errorData.error)) {
        return errorData.error.join(". ");
      }
      if (typeof errorData.error === "string") {
        return errorData.error;
      }
    }
    // Si message no es genérico, usarlo directamente del API
    return errorData.message;
  }

  // Caso 3: { statusCode: 400, message: "Bad Request", error: ["password must be longer..."] }
  // Si error es un array, unir los mensajes
  if (errorData.error) {
    if (Array.isArray(errorData.error)) {
      return errorData.error.join(". ");
    }
    if (typeof errorData.error === "string") {
      return errorData.error;
    }
  }

  // Si message es un array (caso menos común)
  if (Array.isArray(errorData.message)) {
    return errorData.message.join(". ");
  }

  // Fallback
  return "An unknown error occurred";
}

/**
 * Obtiene el título del error según el código de estado HTTP
 * Solo se usa como fallback si no hay mensaje del API
 */
function getErrorTitle(status: number): string {
  if (status >= 300 && status < 400) {
    return "Redirect Error";
  }
  if (status === 400) {
    return "Validation Error";
  }
  if (status === 401) {
    return "Unauthorized";
  }
  if (status === 403) {
    return "Forbidden";
  }
  if (status === 404) {
    return "Not Found";
  }
  if (status === 409) {
    return "Conflict";
  }
  if (status === 422) {
    return "Validation Error";
  }
  if (status >= 500) {
    return "Server Error";
  }
  return "Request Error";
}

/**
 * Maneja errores HTTP y muestra notificaciones
 */
function handleHttpError(error: AxiosError, status: number): void {
  const errorData = error.response?.data as NestJSErrorResponse | undefined;
  const errorMessage = extractErrorMessage(errorData);

  // No mostrar notificación para errores 401 ya que se manejan arriba
  if (status === 401) {
    return;
  }

  // Marcar el error para que Refine no muestre notificaciones automáticas
  // Esto evita notificaciones duplicadas
  if (error.response) {
    (error.response as any).__notificationHandled = true;
  }
  (error as any).__notificationHandled = true;
  (error as any).skipNotification = true;
  
  // Guardar el error en window para que el notification provider pueda verificar
  if (typeof window !== "undefined") {
    (window as any).__lastAxiosError = error;
  }

  // Mostrar notificación de error con el mensaje del API directamente
  // Usar solo el mensaje del API, sin títulos adicionales
  notificationService.error(errorMessage, undefined);
}

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
    
    const status = error.response?.status;
    
    // Handle common error cases
    if (status === 401) {
      console.warn('🔐 Token expired or invalid - clearing token');
      localStorage.removeItem(TOKEN_KEY);
      // Marcar el error para evitar notificaciones duplicadas
      if (error.response) {
        (error.response as any).__notificationHandled = true;
      }
      (error as any).__notificationHandled = true;
      (error as any).skipNotification = true;
      
      // Try to get error message from API, otherwise use default
      const errorData = error.response?.data as NestJSErrorResponse | undefined;
      const errorMessage = extractErrorMessage(errorData);
      notificationService.error(
        errorMessage || "Session expired. Please log in again."
      );
    }
    
    // Handle errors with status codes 300-500
    if (status && status >= 300 && status < 600) {
      handleHttpError(error, status);
    } else if (!error.response && error.request) {
      // Network error (no server response)
      // Mark error to avoid duplicate notifications
      (error as any).__notificationHandled = true;
      (error as any).skipNotification = true;
      notificationService.error(
        "Connection Error",
        "Unable to connect to the server. Please check your internet connection."
      );
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

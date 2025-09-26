import axios from 'axios';
import { LoginCredentials, LoginResponse, User } from '../types/auth.types';

const API_URL = "http://localhost:30000/api";

// Crear una instancia de axios específica para autenticación sin interceptores problemáticos
const authAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class AuthApi {
  private static readonly ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  };

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log("🔐 AuthApi.login() called with:", { email: credentials.email });
    try {
      const response = await authAxios.post(this.ENDPOINTS.LOGIN, credentials);
      console.log("✅ AuthApi.login() success:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ AuthApi.login() error:", error.response?.data || error.message);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    console.log("🚪 AuthApi.logout() called");
    try {
      const token = localStorage.getItem("refine-auth");
      if (token) {
        await authAxios.post(this.ENDPOINTS.LOGOUT, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("✅ AuthApi.logout() success");
      }
    } catch (error: any) {
      console.error("❌ AuthApi.logout() error:", error.response?.data || error.message);
      throw error;
    }
  }

  static async getProfile(): Promise<User> {
    console.log("👤 AuthApi.getProfile() called");
    try {
      const token = localStorage.getItem("refine-auth");
      if (!token) {
        throw new Error("No token found");
      }
      
      const response = await authAxios.get(this.ENDPOINTS.PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ AuthApi.getProfile() success:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ AuthApi.getProfile() error:", error.response?.data || error.message);
      throw error;
    }
  }
}

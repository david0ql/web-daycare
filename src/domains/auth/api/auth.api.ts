import { LoginCredentials, LoginResponse, User } from '../types/auth.types';
import { axiosInstance } from '../../../shared';

export class AuthApi {
  private static readonly ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  };

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post(this.ENDPOINTS.LOGIN, credentials);
      return response.data;
    } catch (error: any) {
      console.error("❌ AuthApi.login() error:", error.response?.data || error.message);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await axiosInstance.post(this.ENDPOINTS.LOGOUT, {});
    } catch (error: any) {
      console.error("❌ AuthApi.logout() error:", error.response?.data || error.message);
      throw error;
    }
  }

  static async getProfile(): Promise<User> {
    try {
      const response = await axiosInstance.get(this.ENDPOINTS.PROFILE);
      return response.data;
    } catch (error: any) {
      console.error("❌ AuthApi.getProfile() error:", error.response?.data || error.message);
      throw error;
    }
  }
}

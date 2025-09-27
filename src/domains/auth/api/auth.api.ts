import { LoginCredentials, LoginResponse, User } from '../types/auth.types';
import { axiosInstance } from '../../../shared';

export class AuthApi {
  private static readonly ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  };

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log("🔐 AuthApi.login() called with:", { email: credentials.email });
    try {
      const response = await axiosInstance.post(this.ENDPOINTS.LOGIN, credentials);
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
      await axiosInstance.post(this.ENDPOINTS.LOGOUT, {});
      console.log("✅ AuthApi.logout() success");
    } catch (error: any) {
      console.error("❌ AuthApi.logout() error:", error.response?.data || error.message);
      throw error;
    }
  }

  static async getProfile(): Promise<User> {
    console.log("👤 AuthApi.getProfile() called");
    try {
      const response = await axiosInstance.get(this.ENDPOINTS.PROFILE);
      console.log("✅ AuthApi.getProfile() success:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ AuthApi.getProfile() error:", error.response?.data || error.message);
      throw error;
    }
  }
}

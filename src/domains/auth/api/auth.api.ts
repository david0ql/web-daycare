import axiosInstance from '../../../shared/config/axios.config';
import { LoginCredentials, LoginResponse, User } from '../types/auth.types';

export class AuthApi {
  private static readonly ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  };

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axiosInstance.post(this.ENDPOINTS.LOGIN, credentials);
    return response.data;
  }

  static async logout(): Promise<void> {
    await axiosInstance.post(this.ENDPOINTS.LOGOUT);
  }

  static async getProfile(): Promise<User> {
    const response = await axiosInstance.get(this.ENDPOINTS.PROFILE);
    return response.data;
  }
}

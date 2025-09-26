import axiosInstance from '../../../shared/config/axios.config';
import { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../types/user.types';

export class UserApi {
  private static readonly ENDPOINTS = {
    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,
    ROLES: '/roles',
  };

  static async getUsers(params?: any): Promise<UserListResponse> {
    const response = await axiosInstance.get(this.ENDPOINTS.USERS, { params });
    return response.data;
  }

  static async getUserById(id: number): Promise<User> {
    const response = await axiosInstance.get(this.ENDPOINTS.USER_BY_ID(id));
    return response.data;
  }

  static async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await axiosInstance.post(this.ENDPOINTS.USERS, userData);
    return response.data;
  }

  static async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await axiosInstance.patch(this.ENDPOINTS.USER_BY_ID(id), userData);
    return response.data;
  }

  static async deleteUser(id: number): Promise<void> {
    await axiosInstance.delete(this.ENDPOINTS.USER_BY_ID(id));
  }

  static async getRoles(): Promise<any[]> {
    const response = await axiosInstance.get(this.ENDPOINTS.ROLES);
    return response.data;
  }
}

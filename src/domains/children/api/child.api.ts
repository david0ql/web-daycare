import axiosInstance from '../../../shared/config/axios.config';
import { Child, CreateChildRequest, UpdateChildRequest, ChildListResponse } from '../types/child.types';

export class ChildApi {
  private static readonly ENDPOINTS = {
    CHILDREN: '/children',
    CHILD_BY_ID: (id: number) => `/children/${id}`,
    CATEGORIES: '/categories',
  };

  static async getChildren(params?: any): Promise<ChildListResponse> {
    const response = await axiosInstance.get(this.ENDPOINTS.CHILDREN, { params });
    return response.data;
  }

  static async getChildById(id: number): Promise<Child> {
    const response = await axiosInstance.get(this.ENDPOINTS.CHILD_BY_ID(id));
    return response.data;
  }

  static async createChild(childData: CreateChildRequest): Promise<Child> {
    const response = await axiosInstance.post(this.ENDPOINTS.CHILDREN, childData);
    return response.data;
  }

  static async updateChild(id: number, childData: UpdateChildRequest): Promise<Child> {
    const response = await axiosInstance.patch(this.ENDPOINTS.CHILD_BY_ID(id), childData);
    return response.data;
  }

  static async deleteChild(id: number): Promise<void> {
    await axiosInstance.delete(this.ENDPOINTS.CHILD_BY_ID(id));
  }

  static async getCategories(): Promise<any[]> {
    const response = await axiosInstance.get(this.ENDPOINTS.CATEGORIES);
    return response.data;
  }
}

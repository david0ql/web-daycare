import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "./shared";

/**
 * Data Provider simplificado para debugging
 * Sin parámetros complejos, solo lo básico
 */
export const simpleDataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    console.log('=== SIMPLE DATA PROVIDER ===');
    console.log('Resource:', resource);
    console.log('Pagination:', pagination);
    console.log('Sorters:', sorters);
    console.log('Filters:', filters);

    // Solo parámetros básicos
    const params: any = {};

    // Paginación simple - usando los nombres que espera tu API
    if (pagination) {
      params.currentPage = (pagination as any).current || 1;
      params.pageSize = pagination.pageSize || 10;
    }

    console.log('Final params:', params);
    console.log('Request URL:', `${axiosInstance.defaults.baseURL}/${resource}`);

    try {
      const response = await axiosInstance.get(`/${resource}`, { params });
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      const data = response.data;
      
      return {
        data: data.data || data,
        total: data.meta?.total || data.length || 0,
      };
    } catch (error: any) {
      console.error('Simple DataProvider Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  getOne: async ({ resource, id, meta }) => {
    console.log('getOne:', { resource, id });
    const response = await axiosInstance.get(`/${resource}/${id}`);
    const data = response.data;
    return { data };
  },

  create: async ({ resource, variables, meta }) => {
    console.log('create:', { resource, variables });
    const response = await axiosInstance.post(`/${resource}`, variables);
    const data = response.data;
    return { data };
  },

  update: async ({ resource, id, variables, meta }) => {
    console.log('update:', { resource, id, variables });
    const response = await axiosInstance.patch(`/${resource}/${id}`, variables);
    const data = response.data;
    return { data };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    console.log('deleteOne:', { resource, id });
    await axiosInstance.delete(`/${resource}/${id}`);
    return { data: { id } as any };
  },

  getApiUrl: () => "http://localhost:30000/api",

  custom: async ({ url, method, payload, meta }) => {
    console.log('custom:', { url, method, payload });
    
    // Si la URL ya incluye el baseURL, no lo agregues de nuevo
    let requestUrl = url;
    if (url.startsWith('http://localhost:30000/api')) {
      // Remover el baseURL de la URL para evitar duplicación
      requestUrl = url.replace('http://localhost:30000/api', '');
    }
    
    const config: any = {
      method: method || "GET",
    };

    if (payload) {
      config.data = payload;
    }

    console.log('Custom request URL:', requestUrl);
    const response = await axiosInstance(requestUrl, config);
    const data = response.data;
    return { data };
  },
};

import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "./shared";

/**
 * Data Provider estable con manejo de errores mejorado
 * Evita bucles infinitos y maneja timeouts correctamente
 */
export const stableDataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    console.log('=== STABLE DATA PROVIDER ===');
    console.log('Resource:', resource);
    console.log('Pagination:', pagination);
    console.log('Sorters:', sorters);
    console.log('Filters:', filters);

    const params: any = {};

    // Paginación
    if (pagination) {
      params.currentPage = (pagination as any).current || 1;
      params.pageSize = pagination.pageSize || 10;
    }

    // Sorting - formato simple
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      if (sorter.field) {
        params.sortBy = sorter.field;
        params.order = sorter.order === "asc" ? "ASC" : "DESC";
      }
    }

    // Filters - formato simple
    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        if (filter.field && filter.value !== undefined) {
          params[filter.field] = filter.value;
        }
      });
    }

    console.log('Final params:', params);
    console.log('Request URL:', `${axiosInstance.defaults.baseURL}/${resource}`);

    try {
      const response = await axiosInstance.get(`/${resource}`, { 
        params,
        timeout: 30000 // Timeout específico para esta petición
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      const data = response.data;
      
      return {
        data: data.data || data || [],
        total: data.meta?.total || data.length || 0,
      };
    } catch (error: any) {
      console.error('Stable DataProvider Error:', error);
      
      // Si es timeout, retornar datos vacíos en lugar de lanzar error
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.warn('Request timeout - returning empty data');
        return {
          data: [],
          total: 0,
        };
      }
      
      // Si es error 400, retornar datos vacíos también
      if (error.response?.status === 400) {
        console.warn('Bad Request - returning empty data');
        return {
          data: [],
          total: 0,
        };
      }
      
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  getOne: async ({ resource, id, meta }) => {
    console.log('getOne:', { resource, id });
    try {
      const response = await axiosInstance.get(`/${resource}/${id}`, {
        timeout: 30000
      });
      const data = response.data;
      return { data };
    } catch (error: any) {
      console.error('getOne error:', error);
      throw error;
    }
  },

  create: async ({ resource, variables, meta }) => {
    console.log('create:', { resource, variables });
    try {
      const response = await axiosInstance.post(`/${resource}`, variables, {
        timeout: 30000
      });
      const data = response.data;
      return { data };
    } catch (error: any) {
      console.error('create error:', error);
      throw error;
    }
  },

  update: async ({ resource, id, variables, meta }) => {
    console.log('update:', { resource, id, variables });
    try {
      const response = await axiosInstance.patch(`/${resource}/${id}`, variables, {
        timeout: 30000
      });
      const data = response.data;
      return { data };
    } catch (error: any) {
      console.error('update error:', error);
      throw error;
    }
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    console.log('deleteOne:', { resource, id });
    try {
      await axiosInstance.delete(`/${resource}/${id}`, {
        timeout: 30000
      });
      return { data: { id } as any };
    } catch (error: any) {
      console.error('deleteOne error:', error);
      throw error;
    }
  },

  getApiUrl: () => "http://localhost:30000/api",

  custom: async ({ url, method, payload, meta }) => {
    console.log('custom:', { url, method, payload });
    
    // Si la URL ya incluye el baseURL, no lo agregues de nuevo
    let requestUrl = url;
    if (url.startsWith('http://localhost:30000/api')) {
      requestUrl = url.replace('http://localhost:30000/api', '');
    }
    
    const config: any = {
      method: method || "GET",
      timeout: 30000
    };

    if (payload) {
      config.data = payload;
    }

    console.log('Custom request URL:', requestUrl);
    
    try {
      const response = await axiosInstance(requestUrl, config);
      const data = response.data;
      return { data };
    } catch (error: any) {
      console.error('custom error:', error);
      
      // Si es timeout, retornar datos vacíos
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.warn('Custom request timeout - returning empty data');
        return { data: [] };
      }
      
      throw error;
    }
  },
};

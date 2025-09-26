import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "./shared";

/**
 * Data Provider con parámetros correctos para la API
 * Usa los nombres exactos que espera el backend NestJS
 */
export const correctDataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    console.log('=== CORRECT DATA PROVIDER ===');
    console.log('Resource:', resource);

    const params: any = {};

    // Paginación - usando los nombres exactos que espera la API
    if (pagination) {
      params.page = (pagination as any).current || 1;
      params.take = pagination.pageSize || 10;
    }

    // Sorting - formato que espera la API
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      if (sorter.field) {
        params.order = sorter.order === "asc" ? "ASC" : "DESC";
        // Nota: La API no parece tener un campo específico para el campo de ordenamiento
        // Solo maneja el orden (ASC/DESC)
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

    try {
      const response = await axiosInstance.get(`/${resource}`, { 
        params,
        timeout: 30000
      });
      
      console.log('Response status:', response.status);
      
      const data = response.data;
      
      return {
        data: data.data || data || [],
        total: data.meta?.totalCount || data.length || 0,
      };
    } catch (error: any) {
      console.error('Correct DataProvider Error:', error);
      
      // Si es error de autenticación, retornar datos vacíos
      if (error.response?.status === 401) {
        console.warn('Authentication error - returning empty data');
        return {
          data: [],
          total: 0,
        };
      }
      
      // Si es timeout, retornar datos vacíos
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
      
      // Para otros errores, lanzar el error
      throw error;
    }
  },

  getOne: async ({ resource, id, meta }) => {
    try {
      const response = await axiosInstance.get(`/${resource}/${id}`, {
        timeout: 30000
      });
      const data = response.data;
      return { data };
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { data: null };
      }
      throw error;
    }
  },

  create: async ({ resource, variables, meta }) => {
    try {
      const response = await axiosInstance.post(`/${resource}`, variables, {
        timeout: 30000
      });
      const data = response.data;
      return { data };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw error;
    }
  },

  update: async ({ resource, id, variables, meta }) => {
    try {
      const response = await axiosInstance.patch(`/${resource}/${id}`, variables, {
        timeout: 30000
      });
      const data = response.data;
      return { data };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw error;
    }
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    try {
      await axiosInstance.delete(`/${resource}/${id}`, {
        timeout: 30000
      });
      return { data: { id } as any };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw error;
    }
  },

  getApiUrl: () => "http://localhost:30000/api",

  custom: async ({ url, method, payload, meta }) => {
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

    try {
      const response = await axiosInstance(requestUrl, config);
      const data = response.data;
      return { data };
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { data: [] };
      }
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return { data: [] };
      }
      
      throw error;
    }
  },
};

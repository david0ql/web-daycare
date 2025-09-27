import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "./shared";

// Cache para evitar peticiones duplicadas
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos



/**
 * Data Provider estable que evita bucles infinitos
 * Usa cache y manejo robusto de errores
 */
export const stableFixedDataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    console.log('=== STABLE FIXED DATA PROVIDER ===');
    console.log('Resource:', resource);

    const params: any = {};

    // Paginación - usando los nombres exactos que espera la API
    if (pagination) {
      params.page = (pagination as any).current || 1;
      // Limitar take a máximo 150 según la validación del backend
      const requestedTake = pagination.pageSize || 10;
      params.take = Math.min(requestedTake, 150);
      
      if (requestedTake > 150) {
        console.warn(`Requested pageSize ${requestedTake} exceeds maximum of 150, using 150 instead`);
      }
    }

    // Sorting - formato que espera la API
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      if (sorter.field) {
        params.order = sorter.order === "asc" ? "ASC" : "DESC";
      }
    }

    // Filters - solo parámetros válidos para la API
    const validApiParams = ['page', 'take', 'order'];
    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        if ('field' in filter && filter.field && 'value' in filter && filter.value !== undefined) {
          // Solo agregar filtros que sean parámetros válidos de la API
          if (validApiParams.includes(filter.field)) {
            params[filter.field] = filter.value;
          } else {
            console.warn(`Filter '${filter.field}' is not a valid API parameter, skipping...`);
          }
        }
      });
    }

    // Crear clave única para el cache
    const cacheKey = `${resource}-${JSON.stringify(params)}`;
    
    // Verificar cache
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached data for:', resource);
      return cached.data;
    }

    console.log('Final params:', params);

    try {
      const response = await axiosInstance.get(`/${resource}`, { 
        params,
        timeout: 10000 // Reducir timeout
      });
      
      console.log('Response status:', response.status);
      
      const data = response.data;
      
      
      const result = {
        data: data.data || data || [],
        total: data.meta?.totalCount || data.length || 0,
      };

      // Guardar en cache
      requestCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error: any) {
      console.error('Stable DataProvider Error:', error);
      
      // Para errores 400, 401, timeout - retornar datos vacíos sin reintentar
      if (error.response?.status === 400 || 
          error.response?.status === 401 || 
          error.code === 'ECONNABORTED' || 
          error.message.includes('timeout')) {
        
        console.warn(`Error ${error.response?.status || 'timeout'} - returning empty data for ${resource}`);
        
        const emptyResult = {
          data: [],
          total: 0,
        };

        // Guardar resultado vacío en cache para evitar reintentos
        requestCache.set(cacheKey, {
          data: emptyResult,
          timestamp: Date.now()
        });

        return emptyResult;
      }
      
      // Para otros errores, lanzar el error
      throw error;
    }
  },

  getOne: async ({ resource, id, meta }) => {
    const cacheKey = `${resource}-${id}`;
    
    // Verificar cache
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached data for getOne:', resource, id);
      return cached.data;
    }

    try {
      console.log('Fetching getOne data for:', resource, id);
      const response = await axiosInstance.get(`/${resource}/${id}`, {
        timeout: 10000
      });
      const data = response.data;
      const result = { data };

      console.log('getOne response data:', data);

      // Guardar en cache
      requestCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error: any) {
      console.error('getOne error:', error);
      if (error.response?.status === 401 || error.response?.status === 400) {
        return { data: null };
      }
      throw error;
    }
  },

  create: async ({ resource, variables, meta }) => {
    try {
      // Use the new endpoint for children with relations
      const url = resource === 'children' ? `/${resource}/with-relations` : `/${resource}`;
      const response = await axiosInstance.post(url, variables, {
        timeout: 10000
      });
      const data = response.data;
      
      // Limpiar cache relacionado
      clearResourceCache(resource);
      
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
      console.log('Updating resource:', resource, id, variables);
      
      // Use with-relations endpoint for children updates
      const url = resource === 'children' ? `/${resource}/${id}/with-relations` : `/${resource}/${id}`;
      
      const response = await axiosInstance.patch(url, variables, {
        timeout: 10000
      });
      const data = response.data;
      
      // Limpiar cache relacionado
      clearResourceCache(resource);
      
      return { data };
    } catch (error: any) {
      console.error('Update error:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw error;
    }
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    try {
      await axiosInstance.delete(`/${resource}/${id}`, {
        timeout: 10000
      });
      
      // Limpiar cache relacionado
      clearResourceCache(resource);
      
      return { data: { id } as any };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw error;
    }
  },

  getApiUrl: () => axiosInstance.defaults.baseURL || "http://localhost:30000/api",

  custom: async ({ url, method, payload, meta }) => {
    let requestUrl = url;
    const baseURL = axiosInstance.defaults.baseURL || "http://localhost:30000/api";
    if (url.startsWith(baseURL)) {
      requestUrl = url.replace(baseURL, '');
    }
    
    const config: any = {
      method: method || "GET",
      timeout: 10000
    };

    if (payload) {
      config.data = payload;
    }

    try {
      const response = await axiosInstance(requestUrl, config);
      const data = response.data;
      return { data };
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        return { data: [] };
      }
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return { data: [] };
      }
      
      throw error;
    }
  },
};

// Función para limpiar cache de un recurso específico
function clearResourceCache(resource: string) {
  const keysToDelete: string[] = [];
  requestCache.forEach((_, key) => {
    if (key.startsWith(`${resource}-`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => requestCache.delete(key));
  console.log(`Cleared cache for resource: ${resource}`);
}

// Limpiar cache periódicamente
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  requestCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => requestCache.delete(key));
}, 60000); // Limpiar cada minuto

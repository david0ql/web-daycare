import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "./shared";

/**
 * Data Provider alternativo que maneja mejor los parámetros de consulta
 * para APIs que esperan un formato específico
 */
export const alternativeDataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    const params: any = {};

    // Add pagination
    if (pagination) {
      params.page = (pagination as any).current || 1;
      params.pageSize = pagination.pageSize || 10;
    }

    // Add sorting - format that matches your API
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      if (sorter.field) {
        params[`sorters[0][field]`] = sorter.field;
        params[`sorters[0][order]`] = sorter.order || "desc";
      }
    }

    // Add filters
    if (filters && filters.length > 0) {
      filters.forEach((filter, index) => {
        if (filter.field && filter.value !== undefined) {
          params[`filters[${index}][field]`] = filter.field;
          params[`filters[${index}][operator]`] = filter.operator || "eq";
          params[`filters[${index}][value]`] = filter.value;
        }
      });
    }

    console.log('Alternative API Request:', { resource, params });
    console.log('Full URL:', `${axiosInstance.defaults.baseURL}/${resource}`);
    console.log('Query String:', new URLSearchParams(params).toString());

    try {
      const response = await axiosInstance.get(`/${resource}`, { params });
      const data = response.data;
      
      return {
        data: data.data || data,
        total: data.meta?.total || data.length,
      };
    } catch (error) {
      console.error('Alternative DataProvider Error:', error);
      throw error;
    }
  },

  getOne: async ({ resource, id, meta }) => {
    const response = await axiosInstance.get(`/${resource}/${id}`);
    const data = response.data;
    return { data };
  },

  create: async ({ resource, variables, meta }) => {
    const transformedVariables = { ...variables } as any;
    if (transformedVariables.isActive !== undefined) {
      transformedVariables.isActive = Boolean(transformedVariables.isActive);
    }

    const response = await axiosInstance.post(`/${resource}`, transformedVariables);
    const data = response.data;
    return { data };
  },

  update: async ({ resource, id, variables, meta }) => {
    const transformedVariables = { ...variables } as any;
    if (transformedVariables.isActive !== undefined) {
      transformedVariables.isActive = Boolean(transformedVariables.isActive);
    }

    const response = await axiosInstance.patch(`/${resource}/${id}`, transformedVariables);
    const data = response.data;
    return { data };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    await axiosInstance.delete(`/${resource}/${id}`);
    return { data: { id } as any };
  },

  getApiUrl: () => "http://localhost:30000/api",

  custom: async ({ url, method, payload, meta }) => {
    const config: any = {
      method: method || "GET",
    };

    if (payload) {
      config.data = payload;
    }

    const response = await axiosInstance(url, config);
    const data = response.data;
    return { data };
  },
};

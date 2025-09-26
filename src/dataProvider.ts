import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "./shared";

export const customDataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    const params: any = {};

    // Add pagination - using correct parameter names for your API
    if (pagination) {
      params.page = (pagination as any).current || 1;
      params.take = pagination.pageSize || 10;
    }

    // Add sorting - your API only supports order (ASC/DESC)
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      // Convert refine order to your API order format
      const order = sorter.order === "asc" ? "ASC" : "DESC";
      params.order = order;
    }

    const response = await axiosInstance.get(`/${resource}`, { params });
    const data = response.data;
    
    return {
      data: data.data || data,
      total: data.meta?.total || data.length,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const response = await axiosInstance.get(`/${resource}/${id}`);
    const data = response.data;
    return { data };
  },

  create: async ({ resource, variables, meta }) => {
    // Transform isActive to boolean if it exists
    const transformedVariables = { ...variables } as any;
    if (transformedVariables.isActive !== undefined) {
      transformedVariables.isActive = Boolean(transformedVariables.isActive);
    }

    const response = await axiosInstance.post(`/${resource}`, transformedVariables);
    const data = response.data;
    return { data };
  },

  update: async ({ resource, id, variables, meta }) => {
    // Transform isActive to boolean if it exists
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

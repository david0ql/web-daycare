import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared';
import { Document, CreateDocumentData, UpdateDocumentData, DocumentType, DocumentTypeWithCount } from '../types/document.types';

// Hook para obtener todos los documentos
export const useDocuments = (params?: any) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/documents', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook para obtener un documento específico
export const useDocument = (id: number) => {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/documents/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener documentos de un niño específico
export const useChildDocuments = (childId: number) => {
  return useQuery({
    queryKey: ['documents', 'child', childId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/documents/child/${childId}`);
      return response.data;
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener tipos de documentos
export const useDocumentTypes = () => {
  return useQuery({
    queryKey: ['document-types'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/documents/types');
        // La respuesta tiene estructura {data: Array, meta: {...}}
        return response.data;
      } catch (error: any) {
        // Si no hay tipos de documento, intentar hacer seed
        if (error.response?.status === 404 || (error.response?.data && Array.isArray(error.response.data) && error.response.data.length === 0)) {
          console.log('No document types found, attempting to seed...');
          try {
            await axiosInstance.post('/documents/types/seed');
            // Retry getting document types after seeding
            const retryResponse = await axiosInstance.get('/documents/types');
            return retryResponse.data;
          } catch (seedError) {
            console.error('Failed to seed document types:', seedError);
            throw error; // Throw original error
          }
        }
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook para obtener tipos de documentos con conteo
export const useDocumentTypesWithCount = () => {
  return useQuery({
    queryKey: ['document-types-with-count'],
    queryFn: async () => {
      const response = await axiosInstance.get('/documents/types/with-count');
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para crear un documento
export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateDocumentData) => {
      const response = await axiosInstance.post('/documents', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-types-with-count'] });
    },
  });
};

// Hook para actualizar un documento
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDocumentData }) => {
      const response = await axiosInstance.patch(`/documents/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
    },
  });
};

// Hook para eliminar un documento
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/documents/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-types-with-count'] });
    },
  });
};

// Hook para subir un archivo de documento
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-types-with-count'] });
    },
  });
};

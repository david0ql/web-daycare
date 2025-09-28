import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared';
import { 
  Incident, 
  CreateIncidentRequest, 
  UpdateIncidentRequest, 
  MarkParentNotifiedRequest,
  CreateIncidentAttachmentRequest 
} from '../types/incident.types';

export const useIncidents = (page = 1, take = 10, order = 'DESC') => {
  return useQuery({
    queryKey: ['incidents', page, take, order],
    queryFn: async () => {
      const response = await axiosInstance.get('/incidents', {
        params: { page, take, order }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIncident = (id: number) => {
  return useQuery({
    queryKey: ['incidents', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/incidents/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useIncidentsByChild = (childId: number, page = 1, take = 10, order = 'DESC') => {
  return useQuery({
    queryKey: ['incidents', 'child', childId, page, take, order],
    queryFn: async () => {
      const response = await axiosInstance.get(`/incidents/child/${childId}`, {
        params: { page, take, order }
      });
      return response.data;
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useIncidentTypes = () => {
  return useQuery({
    queryKey: ['incident-types'],
    queryFn: async () => {
      const response = await axiosInstance.get('/incidents/types');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateIncidentRequest) => {
      const response = await axiosInstance.post('/incidents', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

export const useUpdateIncident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateIncidentRequest }) => {
      const response = await axiosInstance.patch(`/incidents/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incidents', id] });
    },
  });
};

export const useDeleteIncident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/incidents/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

export const useMarkParentNotified = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: MarkParentNotifiedRequest) => {
      const response = await axiosInstance.post('/incidents/mark-parent-notified', data);
      return response.data;
    },
    onSuccess: (_, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incidents', incidentId] });
    },
  });
};

export const useAddIncidentAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateIncidentAttachmentRequest) => {
      const response = await axiosInstance.post('/incidents/attachments', data);
      return response.data;
    },
    onSuccess: (_, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incidents', incidentId] });
    },
  });
};

export const useRemoveIncidentAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attachmentId: number) => {
      const response = await axiosInstance.delete(`/incidents/attachments/${attachmentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

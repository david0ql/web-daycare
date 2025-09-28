import { useState, useEffect } from 'react';
import { axiosInstance } from '../../../shared';
import { DailyObservation, CreateDailyObservationData, UpdateDailyObservationData } from '../types/daily-observations.types';

export const useDailyObservations = (attendanceId?: number) => {
  const [observations, setObservations] = useState<DailyObservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchObservations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = attendanceId 
          ? `/attendance/daily-observations/attendance/${attendanceId}`
          : '/attendance/daily-observations/all';
        
        const response = await axiosInstance.get(endpoint);
        setObservations(response.data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching daily observations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchObservations();
  }, [attendanceId]);

  const createObservation = async (data: CreateDailyObservationData) => {
    try {
      const response = await axiosInstance.post('/attendance/daily-observations', data);
      setObservations(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateObservation = async (id: number, data: UpdateDailyObservationData) => {
    try {
      const response = await axiosInstance.patch(`/attendance/daily-observations/${id}`, data);
      setObservations(prev => 
        prev.map(observation => observation.id === id ? response.data : observation)
      );
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteObservation = async (id: number) => {
    try {
      await axiosInstance.delete(`/attendance/daily-observations/${id}`);
      setObservations(prev => prev.filter(observation => observation.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const refetch = () => {
    setObservations([...observations]);
  };

  return {
    observations,
    isLoading,
    error,
    createObservation,
    updateObservation,
    deleteObservation,
    refetch,
  };
};

export const useDailyObservation = (id: number) => {
  const [observation, setObservation] = useState<DailyObservation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchObservation = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`/attendance/daily-observations/${id}`);
        setObservation(response.data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching daily observation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchObservation();
  }, [id]);

  return {
    observation,
    isLoading,
    error,
  };
};

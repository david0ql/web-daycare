import { useState, useEffect } from 'react';
import { axiosInstance } from '../../../shared';
import { ActivityPhoto, CreateActivityPhotoData, UpdateActivityPhotoData } from '../types/activity-photos.types';

export const useActivityPhotos = (attendanceId?: number) => {
  const [photos, setPhotos] = useState<ActivityPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = attendanceId 
          ? `/attendance/activity-photos/attendance/${attendanceId}`
          : '/attendance/activity-photos/all';
        
        const response = await axiosInstance.get(endpoint);
        setPhotos(response.data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching activity photos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [attendanceId]);

  const createPhoto = async (data: CreateActivityPhotoData, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('childId', data.childId.toString());
      formData.append('attendanceId', data.attendanceId.toString());
      if (data.caption) {
        formData.append('caption', data.caption);
      }

      const response = await axiosInstance.post('/attendance/activity-photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setPhotos(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updatePhoto = async (id: number, data: UpdateActivityPhotoData) => {
    try {
      const response = await axiosInstance.patch(`/attendance/activity-photos/${id}`, data);
      setPhotos(prev => 
        prev.map(photo => photo.id === id ? response.data : photo)
      );
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deletePhoto = async (id: number) => {
    try {
      await axiosInstance.delete(`/attendance/activity-photos/${id}`);
      setPhotos(prev => prev.filter(photo => photo.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const refetch = () => {
    setPhotos([...photos]);
  };

  return {
    photos,
    isLoading,
    error,
    createPhoto,
    updatePhoto,
    deletePhoto,
    refetch,
  };
};

export const useActivityPhoto = (id: number) => {
  const [photo, setPhoto] = useState<ActivityPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`/attendance/activity-photos/${id}`);
        setPhoto(response.data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching activity photo:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

  return {
    photo,
    isLoading,
    error,
  };
};

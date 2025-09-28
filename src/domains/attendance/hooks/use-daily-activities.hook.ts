import { useState, useEffect } from 'react';
import { axiosInstance } from '../../../shared';
import { DailyActivity, CreateDailyActivityData, UpdateDailyActivityData } from '../types/daily-activities.types';

export const useDailyActivities = (attendanceId?: number) => {
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = attendanceId 
          ? `/attendance/daily-activities/attendance/${attendanceId}`
          : '/attendance/daily-activities/all';
        
        const response = await axiosInstance.get(endpoint);
        setActivities(response.data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching daily activities:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [attendanceId]);

  const createActivity = async (data: CreateDailyActivityData) => {
    try {
      const response = await axiosInstance.post('/attendance/daily-activities', data);
      setActivities(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateActivity = async (id: number, data: UpdateDailyActivityData) => {
    try {
      const response = await axiosInstance.patch(`/attendance/daily-activities/${id}`, data);
      setActivities(prev => 
        prev.map(activity => activity.id === id ? response.data : activity)
      );
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteActivity = async (id: number) => {
    try {
      await axiosInstance.delete(`/attendance/daily-activities/${id}`);
      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const refetch = () => {
    setActivities([...activities]);
  };

  return {
    activities,
    isLoading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    refetch,
  };
};

export const useDailyActivity = (id: number) => {
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`/attendance/daily-activities/${id}`);
        setActivity(response.data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching daily activity:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  return {
    activity,
    isLoading,
    error,
  };
};

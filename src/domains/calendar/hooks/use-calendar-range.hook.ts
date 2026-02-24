import { useState, useEffect } from 'react';
import { axiosInstance } from '../../../shared';
import { CalendarEvent } from '../types/calendar.types';

export const useCalendarRange = (startDate: string, endDate: string) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!startDate || !endDate) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axiosInstance.get('/calendar/events/range', {
          params: { startDate, endDate }
        });
        setEvents(response.data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching calendar events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [startDate, endDate, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  return { events, isLoading, error, refetch };
};

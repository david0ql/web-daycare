import { useState, useEffect } from 'react';
import { axiosInstance } from '../../../shared';
import { CalendarEvent, CalendarFilter } from '../types/calendar.types';
import { CalendarUtils } from '../utils/calendar.utils';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

// Extend dayjs with plugins
dayjs.extend(isBetween);

export const useCalendarEvents = (filters?: CalendarFilter) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axiosInstance.get('/calendar/events/range', {
          params: {
            startDate: filters?.startDate || '2020-01-01',
            endDate: filters?.endDate || '2030-12-31',
            ...filters
          }
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
  }, [filters]);

  const refetch = () => {
    // Trigger re-fetch by updating a dummy state
    setEvents([...events]);
  };

  return {
    events,
    isLoading,
    error,
    refetch,
    // Helper functions
    getEventsForDate: (date: string) => CalendarUtils.getEventsForDate(events, date),
    getEventsForMonth: (year: number, month: number) => {
      const monthEvents = events.filter(event => {
        const eventStart = dayjs(event.startDate);
        return eventStart.year() === year && eventStart.month() === month - 1;
      });
      return monthEvents;
    },
    getUpcomingEvents: (days: number = 7) => CalendarUtils.getUpcomingEvents(events, days),
    getTodayEvents: () => {
      const today = dayjs().format('YYYY-MM-DD');
      return CalendarUtils.getEventsForDate(events, today);
    },
  };
};

export const useCalendarEvent = (id: number) => {
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axiosInstance.get(`/calendar/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching calendar event:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const refetch = () => {
    // Trigger re-fetch by updating a dummy state
    setEvent(event ? { ...event } : null);
  };

  return {
    event,
    isLoading,
    error,
    refetch,
  };
};

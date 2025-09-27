import { axiosInstance } from '../../../shared';
import { 
  CalendarEvent, 
  CreateCalendarEventData, 
  UpdateCalendarEventData, 
  CalendarFilter,
  CalendarEventResponse,
  CalendarRangeResponse 
} from '../types/calendar.types';

export const calendarApi = {
  // Get all calendar events with pagination and filters
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    eventType?: string;
    startDate?: string;
    endDate?: string;
    createdBy?: number;
  }): Promise<CalendarEventResponse> => {
    const response = await axiosInstance.get('/calendar/events', { params });
    return response.data;
  },

  // Get events in a date range
  getEventsInRange: async (startDate: string, endDate: string): Promise<CalendarRangeResponse> => {
    const response = await axiosInstance.get('/calendar/events/range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get events for a specific month
  getEventsForMonth: async (year: number, month: number): Promise<CalendarRangeResponse> => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
    return calendarApi.getEventsInRange(startDate, endDate);
  },

  // Create a new calendar event
  createEvent: async (data: CreateCalendarEventData): Promise<CalendarEvent> => {
    const response = await axiosInstance.post('/calendar/events', data);
    return response.data;
  },

  // Update an existing calendar event
  updateEvent: async (id: number, data: UpdateCalendarEventData): Promise<CalendarEvent> => {
    const response = await axiosInstance.patch(`/calendar/events/${id}`, data);
    return response.data;
  },

  // Delete a calendar event
  deleteEvent: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/calendar/events/${id}`);
  },

  // Get a specific calendar event
  getEvent: async (id: number): Promise<CalendarEvent> => {
    const response = await axiosInstance.get(`/calendar/events/${id}`);
    return response.data;
  },
};

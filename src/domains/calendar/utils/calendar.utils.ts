import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { CalendarEvent, EventTypeEnum, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../types/calendar.types';

// Extend dayjs with plugins
dayjs.extend(isBetween);

export class CalendarUtils {
  /**
   * Format date for display
   */
  static formatDate(date: string | Date, format: string = 'DD/MM/YYYY'): string {
    return dayjs(date).format(format);
  }

  /**
   * Format time for display
   */
  static formatTime(time: string | Date, format: string = 'HH:mm'): string {
    return dayjs(time).format(format);
  }

  /**
   * Format datetime for display
   */
  static formatDateTime(date: string | Date, format: string = 'DD/MM/YYYY HH:mm'): string {
    return dayjs(date).format(format);
  }

  /**
   * Get event type label in Spanish
   */
  static getEventTypeLabel(eventType: EventTypeEnum): string {
    return EVENT_TYPE_LABELS[eventType] || eventType;
  }

  /**
   * Get event type color
   */
  static getEventTypeColor(eventType: EventTypeEnum): string {
    return EVENT_TYPE_COLORS[eventType] || '#1890ff';
  }

  /**
   * Check if an event is happening today
   */
  static isEventToday(event: CalendarEvent): boolean {
    const today = dayjs().format('YYYY-MM-DD');
    const startDate = dayjs(event.startDate).format('YYYY-MM-DD');
    const endDate = dayjs(event.endDate).format('YYYY-MM-DD');
    
    return dayjs(today).isBetween(startDate, endDate, 'day', '[]');
  }

  /**
   * Check if an event is happening this week
   */
  static isEventThisWeek(event: CalendarEvent): boolean {
    const startOfWeek = dayjs().startOf('week');
    const endOfWeek = dayjs().endOf('week');
    const eventStart = dayjs(event.startDate);
    const eventEnd = dayjs(event.endDate);
    
    return eventStart.isBetween(startOfWeek, endOfWeek, 'day', '[]') ||
           eventEnd.isBetween(startOfWeek, endOfWeek, 'day', '[]') ||
           (eventStart.isBefore(startOfWeek) && eventEnd.isAfter(endOfWeek));
  }

  /**
   * Get events for a specific date
   */
  static getEventsForDate(events: CalendarEvent[], date: string): CalendarEvent[] {
    const targetDate = dayjs(date).format('YYYY-MM-DD');
    return events.filter(event => {
      const startDate = dayjs(event.startDate).format('YYYY-MM-DD');
      const endDate = dayjs(event.endDate).format('YYYY-MM-DD');
      return dayjs(targetDate).isBetween(startDate, endDate, 'day', '[]');
    });
  }

  /**
   * Transform calendar events for calendar display
   */
  static transformEventsForCalendar(events: CalendarEvent[]) {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.eventType,
      date: event.startDate,
      isAllDay: event.isAllDay,
      startTime: event.startTime,
      endTime: event.endTime,
      color: this.getEventTypeColor(event.eventType),
      createdBy: {
        id: event.createdBy,
        name: event.createdByUser 
          ? `${event.createdByUser.firstName} ${event.createdByUser.lastName}`
          : 'Usuario'
      }
    }));
  }

  /**
   * Get date range for current month
   */
  static getCurrentMonthRange() {
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');
    
    return {
      startDate: startOfMonth.format('YYYY-MM-DD'),
      endDate: endOfMonth.format('YYYY-MM-DD')
    };
  }

  /**
   * Get date range for a specific month
   * @param year - Year (e.g., 2024)
   * @param month - Month (1-12, not 0-based)
   */
  static getMonthRange(year: number, month: number) {
    // month is 1-based (1=Jan, 2=Feb, ..., 12=Dec)
    // Use dayjs with string format to avoid month index confusion
    const dateString = `${year}-${month.toString().padStart(2, '0')}-01`;
    const startOfMonth = dayjs(dateString).startOf('month');
    const endOfMonth = dayjs(dateString).endOf('month');
    
    return {
      startDate: startOfMonth.format('YYYY-MM-DD'),
      endDate: endOfMonth.format('YYYY-MM-DD')
    };
  }

  /**
   * Validate event dates
   */
  static validateEventDates(startDate: string, endDate: string): boolean {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    
    return start.isValid() && end.isValid() && start.isSameOrBefore(end);
  }

  /**
   * Check if two events overlap
   */
  static doEventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
    const start1 = dayjs(event1.startDate);
    const end1 = dayjs(event1.endDate);
    const start2 = dayjs(event2.startDate);
    const end2 = dayjs(event2.endDate);
    
    return start1.isBefore(end2) && start2.isBefore(end1);
  }

  /**
   * Get upcoming events (next 7 days)
   */
  static getUpcomingEvents(events: CalendarEvent[], days: number = 7): CalendarEvent[] {
    const today = dayjs();
    const futureDate = dayjs().add(days, 'days');
    
    return events.filter(event => {
      const eventStart = dayjs(event.startDate);
      return eventStart.isBetween(today, futureDate, 'day', '[]');
    }).sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));
  }

  /**
   * Format event duration
   */
  static getEventDuration(event: CalendarEvent): string {
    if (event.isAllDay) {
      const start = dayjs(event.startDate);
      const end = dayjs(event.endDate);
      
      if (start.isSame(end, 'day')) {
        return 'Todo el día';
      } else {
        const days = end.diff(start, 'days') + 1;
        return `${days} día${days > 1 ? 's' : ''}`;
      }
    } else if (event.startTime && event.endTime) {
      const start = dayjs(`${event.startDate} ${event.startTime}`);
      const end = dayjs(`${event.endDate} ${event.endTime}`);
      const duration = end.diff(start);
      
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${minutes}m`;
      }
    }
    
    return 'Duración no especificada';
  }
}

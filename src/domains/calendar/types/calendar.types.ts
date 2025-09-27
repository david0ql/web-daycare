export enum EventTypeEnum {
  HOLIDAY = 'holiday',
  VACATION = 'vacation',
  MEETING = 'meeting',
  EVENT = 'event',
  CLOSURE = 'closure',
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventType: EventTypeEnum;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  createdByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateCalendarEventData {
  title: string;
  description?: string;
  eventType: EventTypeEnum;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
}

export interface UpdateCalendarEventData extends Partial<CreateCalendarEventData> {
  id: number;
}

export interface CalendarFilter {
  eventType?: EventTypeEnum;
  startDate?: string;
  endDate?: string;
  createdBy?: number;
}

export interface CalendarEventResponse {
  data: CalendarEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CalendarRangeResponse {
  data: CalendarEvent[];
}

// Calendar display types
export interface CalendarDisplayEvent {
  id: number;
  title: string;
  description?: string;
  type: EventTypeEnum;
  date: string;
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
  color: string;
  createdBy: {
    id: number;
    name: string;
  };
}

// Event type colors mapping
export const EVENT_TYPE_COLORS = {
  [EventTypeEnum.HOLIDAY]: '#ff4d4f',
  [EventTypeEnum.VACATION]: '#52c41a',
  [EventTypeEnum.MEETING]: '#1890ff',
  [EventTypeEnum.EVENT]: '#722ed1',
  [EventTypeEnum.CLOSURE]: '#fa8c16',
} as const;

// Event type labels
export const EVENT_TYPE_LABELS = {
  [EventTypeEnum.HOLIDAY]: 'Día Festivo',
  [EventTypeEnum.VACATION]: 'Vacaciones',
  [EventTypeEnum.MEETING]: 'Reunión',
  [EventTypeEnum.EVENT]: 'Evento',
  [EventTypeEnum.CLOSURE]: 'Cierre',
} as const;

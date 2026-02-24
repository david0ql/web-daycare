import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Card, Tag, Space, Typography, Button, Tooltip, Badge, Empty, Popconfirm, message } from 'antd';
import { PlusOutlined, CalendarOutlined, ClockCircleOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { CalendarEvent, EventTypeEnum } from '../types/calendar.types';
import { CalendarUtils } from '../utils/calendar.utils';
import { useCalendarRange } from '../hooks/use-calendar-range.hook';
import { calendarApi } from '../api/calendar.api';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useLanguage } from '../../../shared/contexts/language.context';

// Extend dayjs with plugins
dayjs.extend(isBetween);

const { Title, Text } = Typography;

interface CalendarListProps {
  onCreateEvent?: () => void;
}

const CALENDAR_LIST_TRANSLATIONS = {
  english: {
    documentTitle: "Event Calendar | The Children's World",
    pageTitle: "Event Calendar",
    createEvent: "Create Event",
    eventsFor: "Events for",
    noEventsForDate: "No events for this date",
    more: "more",
    allDay: "All Day",
    createdBy: "Created by",
    eventTypeLegend: "Event Type Legend",
    viewEvent: "View event",
    editEvent: "Edit event",
    deleteEvent: "Delete event",
    deleteConfirm: "Are you sure you want to delete this event?",
    deleteOk: "Yes, delete",
    cancel: "Cancel",
    deleteSuccess: "Event deleted successfully",
    deleteError: "Error deleting event",
  },
  spanish: {
    documentTitle: "Calendario de eventos | The Children's World",
    pageTitle: "Calendario de eventos",
    createEvent: "Crear evento",
    eventsFor: "Eventos para",
    noEventsForDate: "No hay eventos para esta fecha",
    more: "más",
    allDay: "Todo el día",
    createdBy: "Creado por",
    eventTypeLegend: "Leyenda de tipos de evento",
    viewEvent: "Ver evento",
    editEvent: "Editar evento",
    deleteEvent: "Eliminar evento",
    deleteConfirm: "¿Está seguro de eliminar este evento?",
    deleteOk: "Sí, eliminar",
    cancel: "Cancelar",
    deleteSuccess: "Evento eliminado correctamente",
    deleteError: "Error al eliminar evento",
  },
} as const;

export const CalendarList: React.FC<CalendarListProps> = ({ onCreateEvent }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = CALENDAR_LIST_TRANSLATIONS[language];
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  
  // Get events for the current month
  const currentMonth = selectedDate.month() + 1; // dayjs.month() is 0-based, so add 1
  const currentYear = selectedDate.year();
  
  // Get events for the current month using the range endpoint
  const monthRange = CalendarUtils.getMonthRange(currentYear, currentMonth);
  
  const { events, isLoading, refetch } = useCalendarRange(monthRange.startDate, monthRange.endDate);

  // Transform events for calendar display
  const calendarEvents = useMemo(() => {
    return CalendarUtils.transformEventsForCalendar(events, language);
  }, [events]);

  // Get events for a specific date
  const getEventsForDate = (date: dayjs.Dayjs): CalendarEvent[] => {
    const dateString = date.format('YYYY-MM-DD');
    return CalendarUtils.getEventsForDate(events, dateString);
  };

  // Calendar cell renderer
  const dateCellRender = (date: dayjs.Dayjs) => {
    const dateEvents = getEventsForDate(date);
    
    if (dateEvents.length === 0) {
      return null;
    }

    return (
      <div style={{ maxHeight: '60px', overflow: 'hidden' }}>
        {dateEvents.slice(0, 2).map((event) => (
          <Tooltip
            key={event.id}
            title={
              <div>
                <div><strong>{event.title}</strong></div>
                {event.description && <div>{event.description}</div>}
                <div>
                  <Tag color={CalendarUtils.getEventTypeColor(event.eventType)}>
                    {CalendarUtils.getEventTypeLabel(event.eventType, language)}
                  </Tag>
                </div>
                {!event.isAllDay && event.startTime && (
                  <div>
                    <ClockCircleOutlined /> {event.startTime}
                    {event.endTime && ` - ${event.endTime}`}
                  </div>
                )}
              </div>
            }
          >
            <div
              style={{
                background: CalendarUtils.getEventTypeColor(event.eventType),
                color: 'white',
                padding: '2px 4px',
                margin: '1px 0',
                borderRadius: '3px',
                fontSize: '11px',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/calendar/edit/${event.id}`);
              }}
            >
              {event.title}
            </div>
          </Tooltip>
        ))}
        {dateEvents.length > 2 && (
          <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>
            +{dateEvents.length - 2} {t.more}
          </div>
        )}
      </div>
    );
  };

  // Calendar month cell renderer
  const monthCellRender = (date: dayjs.Dayjs) => {
    const monthEvents = events.filter((event: CalendarEvent) => {
      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);
      return eventStart.isSame(date, 'month') || eventEnd.isSame(date, 'month');
    });

    if (monthEvents.length === 0) {
      return null;
    }

    return (
      <div style={{ textAlign: 'center' }}>
        <Badge count={monthEvents.length} />
      </div>
    );
  };

  // Handle date selection
  const onDateSelect = (date: dayjs.Dayjs) => {
    setSelectedDate(date);
  };

  // Handle panel change (month/year navigation)
  const onPanelChange = (date: dayjs.Dayjs, mode: string) => {
    setSelectedDate(date);
  };

  // Get events for selected date
  const selectedDateEvents = getEventsForDate(selectedDate);

  useEffect(() => {
    document.title = t.documentTitle;
  }, [t.documentTitle]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          <CalendarOutlined /> {t.pageTitle}
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/calendar/create')}
          size="large"
        >
          {t.createEvent}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Calendar */}
        <Card>
          <Calendar
            dateCellRender={dateCellRender}
            monthCellRender={monthCellRender}
            onSelect={onDateSelect}
            onPanelChange={onPanelChange}
            value={selectedDate}
            style={{ width: '100%' }}
          />
        </Card>

        {/* Selected Date Events */}
        <Card
          title={`${t.eventsFor} ${
            selectedDate.format(language === "spanish" ? "DD [de] MMMM, YYYY" : "MMMM DD, YYYY")
          }`}
        >
          {selectedDateEvents.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t.noEventsForDate}
            />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {selectedDateEvents.map((event) => (
                <Card key={event.id} size="small">
                  <div style={{ marginBottom: '8px' }}>
                    <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
                      {event.title}
                    </Title>
                    {event.description && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {event.description}
                      </Text>
                    )}
                  </div>
                  
                  <Space wrap>
                    <Tag color={CalendarUtils.getEventTypeColor(event.eventType)}>
                      {CalendarUtils.getEventTypeLabel(event.eventType, language)}
                    </Tag>
                    
                    {!event.isAllDay && event.startTime && (
                      <Tag icon={<ClockCircleOutlined />}>
                        {event.startTime}
                        {event.endTime && ` - ${event.endTime}`}
                      </Tag>
                    )}
                    
                    {event.isAllDay && (
                      <Tag>{t.allDay}</Tag>
                    )}
                  </Space>
                  
                  {event.createdByUser && (
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {t.createdBy}: {event.createdByUser.firstName} {event.createdByUser.lastName}
                      </Text>
                    </div>
                  )}

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                    <Tooltip title={t.viewEvent}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/calendar/show/${event.id}`)}
                      />
                    </Tooltip>
                    <Tooltip title={t.editEvent}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/calendar/edit/${event.id}`)}
                      />
                    </Tooltip>
                    <Popconfirm
                      title={t.deleteConfirm}
                      okText={t.deleteOk}
                      cancelText={t.cancel}
                      onConfirm={async () => {
                        try {
                          await calendarApi.deleteEvent(event.id);
                          message.success(t.deleteSuccess);
                          refetch();
                        } catch {
                          message.error(t.deleteError);
                        }
                      }}
                    >
                      <Tooltip title={t.deleteEvent}>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Tooltip>
                    </Popconfirm>
                  </div>
                </Card>
              ))}
            </Space>
          )}
        </Card>
      </div>

      {/* Event Type Legend */}
      <Card title={t.eventTypeLegend} style={{ marginTop: '24px' }}>
        <Space wrap>
          {Object.values(EventTypeEnum).map((eventType) => (
            <Tag
              key={eventType}
              color={CalendarUtils.getEventTypeColor(eventType)}
              style={{ marginBottom: '8px' }}
            >
              {CalendarUtils.getEventTypeLabel(eventType, language)}
            </Tag>
          ))}
        </Space>
      </Card>
    </div>
  );
};

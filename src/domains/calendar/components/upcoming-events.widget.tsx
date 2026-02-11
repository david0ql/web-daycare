import React from 'react';
import { Card, List, Tag, Typography, Button, Space, Empty } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useCalendarEvents } from '../hooks/use-calendar.hook';
import { EventTypeEnum } from '../types/calendar.types';
import { CalendarUtils } from '../utils/calendar.utils';
import dayjs from 'dayjs';
import { useLanguage } from '../../../shared/contexts/language.context';

const { Title, Text } = Typography;

interface UpcomingEventsWidgetProps {
  title?: string;
  maxItems?: number;
  showCreateButton?: boolean;
}

const UPCOMING_EVENTS_TRANSLATIONS = {
  english: {
    defaultTitle: "Upcoming Events",
    create: "Create",
    noUpcomingEvents: "No upcoming events",
    allDay: "All Day",
    viewAll: "View all events",
  },
  spanish: {
    defaultTitle: "Próximos eventos",
    create: "Crear",
    noUpcomingEvents: "No hay eventos próximos",
    allDay: "Todo el día",
    viewAll: "Ver todos los eventos",
  },
} as const;

export const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({
  title,
  maxItems = 5,
  showCreateButton = true,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = UPCOMING_EVENTS_TRANSLATIONS[language];
  const resolvedTitle = title ?? t.defaultTitle;
  const { getUpcomingEvents, isLoading } = useCalendarEvents();

  const upcomingEvents = getUpcomingEvents(30).slice(0, maxItems);

  const handleEventClick = (eventId: number) => {
    navigate(`/calendar/edit/${eventId}`);
  };

  const handleCreateEvent = () => {
    navigate('/calendar/create');
  };

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined />
          {resolvedTitle}
        </Space>
      }
      extra={
        showCreateButton && (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleCreateEvent}
          >
            {t.create}
          </Button>
        )
      }
      loading={isLoading}
    >
      {upcomingEvents.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t.noUpcomingEvents}
          style={{ padding: '20px 0' }}
        />
      ) : (
        <List
          dataSource={upcomingEvents}
          renderItem={(event) => (
            <List.Item
              style={{ 
                cursor: 'pointer',
                padding: '12px 0',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => handleEventClick(event.id)}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text strong style={{ fontSize: '14px' }}>
                      {event.title}
                    </Text>
                    <Tag
                      color={CalendarUtils.getEventTypeColor(event.eventType)}
                    >
                      {CalendarUtils.getEventTypeLabel(event.eventType, language)}
                    </Tag>
                  </div>
                }
                description={
                  <Space direction="vertical" size="small">
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(event.startDate).format(
                          language === "spanish" ? "DD [de] MMMM, YYYY" : "MMMM DD, YYYY",
                        )}
                      </Text>
                      {!event.isAllDay && event.startTime && (
                        <div>
                          <ClockCircleOutlined style={{ marginRight: '4px' }} />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </Text>
                        </div>
                      )}
                      {event.isAllDay && (
                        <Tag style={{ fontSize: '10px' }}>
                          {t.allDay}
                        </Tag>
                      )}
                    </div>
                    {event.description && (
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {event.description.length > 60 
                          ? `${event.description.substring(0, 60)}...`
                          : event.description
                        }
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
      
      {upcomingEvents.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Button
            type="link"
            size="small"
            onClick={() => navigate('/calendar')}
          >
            {t.viewAll}
          </Button>
        </div>
      )}
    </Card>
  );
};

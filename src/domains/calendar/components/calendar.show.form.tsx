import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, TimePicker, Switch, Card, Row, Col, Typography, Button } from 'antd';
import { useNavigate } from 'react-router';
import { EventTypeEnum, EVENT_TYPE_LABELS_BY_LANGUAGE } from '../types/calendar.types';
import { useCalendarEvent } from '../hooks/use-calendar.hook';
import dayjs from 'dayjs';
import { useLanguage } from '../../../shared/contexts/language.context';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CalendarShowFormProps {
  eventId: number;
}

const CALENDAR_SHOW_FORM_TRANSLATIONS = {
  english: {
    documentTitle: "Event Details | The Children's World",
    header: "Event Details",
    notFoundTitle: "Event Not Found",
    notFoundDesc: "Could not load the event or it does not exist.",
    eventTitle: "Event Title",
    eventType: "Event Type",
    allDay: "All Day",
    startDate: "Start Date",
    endDate: "End Date",
    startTime: "Start Time",
    endTime: "End Time",
    description: "Description",
    backToCalendar: "Back to Calendar",
    editEvent: "Edit Event",
  },
  spanish: {
    documentTitle: "Detalles del evento | The Children's World",
    header: "Detalles del evento",
    notFoundTitle: "Evento no encontrado",
    notFoundDesc: "No se pudo cargar el evento o no existe.",
    eventTitle: "Título del evento",
    eventType: "Tipo de evento",
    allDay: "Todo el día",
    startDate: "Fecha inicio",
    endDate: "Fecha fin",
    startTime: "Hora inicio",
    endTime: "Hora fin",
    description: "Descripción",
    backToCalendar: "Volver al calendario",
    editEvent: "Editar evento",
  },
} as const;

export const CalendarShowForm: React.FC<CalendarShowFormProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = CALENDAR_SHOW_FORM_TRANSLATIONS[language];
  const [form] = Form.useForm();
  
  const { event, isLoading, error } = useCalendarEvent(eventId);

  useEffect(() => {
    document.title = t.documentTitle;
  }, [t.documentTitle]);

  useEffect(() => {
    if (event) {
      const formValues = {
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startDate: dayjs(event.startDate),
        endDate: dayjs(event.endDate),
        isAllDay: event.isAllDay,
        startTime: event.startTime ? dayjs(event.startTime, 'HH:mm') : undefined,
        endTime: event.endTime ? dayjs(event.endTime, 'HH:mm') : undefined,
      };
      form.setFieldsValue(formValues);
    }
  }, [event, form]);

  if (isLoading) {
    return <Card loading />;
  }

  if (error || !event) {
    return (
      <Card>
        <Title level={4}>{t.notFoundTitle}</Title>
        <p>{t.notFoundDesc}</p>
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4} style={{ marginBottom: '24px' }}>
        {t.header}
      </Title>
      
      <Form form={form} layout="vertical" disabled>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={t.eventTitle} name="title">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t.eventType} name="eventType">
              <Select>
                {Object.values(EventTypeEnum).map((type) => (
                  <Option key={type} value={type}>
                    {EVENT_TYPE_LABELS_BY_LANGUAGE[language][type]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item label={t.allDay} name="isAllDay" valuePropName="checked">
              <Switch disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t.startDate} name="startDate">
              <DatePicker
                style={{ width: '100%' }}
                format={language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY"}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t.endDate} name="endDate">
              <DatePicker
                style={{ width: '100%' }}
                format={language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY"}
              />
            </Form.Item>
          </Col>
        </Row>

        {(!event.isAllDay || event.startTime || event.endTime) && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t.startTime} name="startTime">
                <TimePicker style={{ width: '100%' }} format="h:mm A" use12Hours />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t.endTime} name="endTime">
                <TimePicker style={{ width: '100%' }} format="h:mm A" use12Hours />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={t.description} name="description">
              <TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button type="default" onClick={() => navigate('/calendar')}>
              {t.backToCalendar}
            </Button>
            <Button type="primary" onClick={() => navigate(`/calendar/edit/${eventId}`)}>
              {t.editEvent}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

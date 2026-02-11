import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, TimePicker, Switch, Card, Row, Col, Typography } from 'antd';
import { useCreate } from '@refinedev/core';
import { useNavigate } from 'react-router';
import { CreateCalendarEventData, EventTypeEnum, EVENT_TYPE_LABELS_BY_LANGUAGE } from '../types/calendar.types';
import dayjs from 'dayjs';
import { useLanguage } from '../../../shared/contexts/language.context';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CalendarCreateFormProps {
  onSuccess?: () => void;
}

const CALENDAR_CREATE_FORM_TRANSLATIONS = {
  english: {
    header: "Create New Event",
    eventTitle: "Event Title",
    eventTitleRequired: "Please enter the event title",
    titleTooLong: "Title cannot exceed 255 characters",
    titlePlaceholder: "Enter event title",
    eventType: "Event Type",
    eventTypeRequired: "Please select the event type",
    eventTypePlaceholder: "Select event type",
    allDay: "All Day",
    startDate: "Start Date",
    startDateRequired: "Please select the start date",
    startDatePlaceholder: "Select start date",
    endDate: "End Date",
    endDateRequired: "Please select the end date",
    endDatePlaceholder: "Select end date",
    startTime: "Start Time",
    startTimeRequired: "Please select the start time",
    startTimePlaceholder: "Select start time",
    endTime: "End Time",
    endTimeRequired: "Please select the end time",
    endTimePlaceholder: "Select end time",
    description: "Description",
    descriptionPlaceholder: "Enter event description (optional)",
    cancel: "Cancel",
    creating: "Creating...",
    createEvent: "Create Event",
  },
  spanish: {
    header: "Crear nuevo evento",
    eventTitle: "Título del evento",
    eventTitleRequired: "Por favor ingresa el título del evento",
    titleTooLong: "El título no puede superar 255 caracteres",
    titlePlaceholder: "Ingresa el título del evento",
    eventType: "Tipo de evento",
    eventTypeRequired: "Por favor selecciona el tipo de evento",
    eventTypePlaceholder: "Selecciona tipo de evento",
    allDay: "Todo el día",
    startDate: "Fecha inicio",
    startDateRequired: "Por favor selecciona la fecha de inicio",
    startDatePlaceholder: "Selecciona fecha de inicio",
    endDate: "Fecha fin",
    endDateRequired: "Por favor selecciona la fecha de fin",
    endDatePlaceholder: "Selecciona fecha de fin",
    startTime: "Hora inicio",
    startTimeRequired: "Por favor selecciona la hora de inicio",
    startTimePlaceholder: "Selecciona hora de inicio",
    endTime: "Hora fin",
    endTimeRequired: "Por favor selecciona la hora de fin",
    endTimePlaceholder: "Selecciona hora de fin",
    description: "Descripción",
    descriptionPlaceholder: "Ingresa la descripción del evento (opcional)",
    cancel: "Cancelar",
    creating: "Creando...",
    createEvent: "Crear evento",
  },
} as const;

export const CalendarCreateForm: React.FC<CalendarCreateFormProps> = ({ onSuccess }) => {
  console.log('🔍 CalendarCreateForm: Componente montado');
  
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = CALENDAR_CREATE_FORM_TRANSLATIONS[language];
  const [form] = Form.useForm();
  const [isAllDay, setIsAllDay] = useState(true);
  
  const { mutate: createEvent, mutation } = useCreate();
  const isLoading = mutation.isPending;

  const handleSubmit = (values: any) => {
    const eventData: CreateCalendarEventData = {
      title: values.title,
      description: values.description,
      eventType: values.eventType,
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD'),
      isAllDay: Boolean(isAllDay), // Ensure it's always a boolean
      startTime: isAllDay ? undefined : values.startTime?.format('HH:mm'),
      endTime: isAllDay ? undefined : values.endTime?.format('HH:mm'),
    };

    createEvent(
      {
        resource: 'calendar/events',
        values: eventData,
      },
      {
        onSuccess: () => {
          form.resetFields();
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/calendar');
          }
        },
        onError: (error) => {
          console.error('Error creating event:', error);
        },
      }
    );
  };

  const handleAllDayChange = (checked: boolean) => {
    setIsAllDay(checked);
    if (checked) {
      form.setFieldsValue({ startTime: undefined, endTime: undefined });
    }
  };

  return (
    <Card>
      <Title level={4} style={{ marginBottom: '24px' }}>
        {t.header}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          eventType: EventTypeEnum.EVENT,
          isAllDay: true,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t.eventTitle}
              name="title"
              rules={[
                { required: true, message: t.eventTitleRequired },
                { max: 255, message: t.titleTooLong }
              ]}
            >
              <Input placeholder={t.titlePlaceholder} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.eventType}
              name="eventType"
              rules={[{ required: true, message: t.eventTypeRequired }]}
            >
              <Select placeholder={t.eventTypePlaceholder}>
                {Object.values(EventTypeEnum).map((type) => (
                  <Option key={type} value={type}>
                    {EVENT_TYPE_LABELS_BY_LANGUAGE[language][type]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label={t.allDay}
              name="isAllDay"
              valuePropName="checked"
              getValueFromEvent={(checked) => Boolean(checked)}
              getValueProps={(value) => ({ value: Boolean(value) })}
            >
              <Switch 
                checked={isAllDay}
                onChange={handleAllDayChange}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.startDate}
              name="startDate"
              rules={[{ required: true, message: t.startDateRequired }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder={t.startDatePlaceholder}
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label={t.endDate}
              name="endDate"
              rules={[{ required: true, message: t.endDateRequired }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder={t.endDatePlaceholder}
              />
            </Form.Item>
          </Col>
        </Row>

        {!isAllDay && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t.startTime}
                name="startTime"
                rules={[{ required: true, message: t.startTimeRequired }]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder={t.startTimePlaceholder}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label={t.endTime}
                name="endTime"
                rules={[{ required: true, message: t.endTimeRequired }]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder={t.endTimePlaceholder}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t.description}
              name="description"
            >
              <TextArea 
                rows={4}
                placeholder={t.descriptionPlaceholder}
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Form.Item style={{ margin: 0 }}>
              <button
                type="button"
                onClick={() => navigate('/calendar')}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                {t.cancel}
              </button>
            </Form.Item>
            <Form.Item style={{ margin: 0 }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#1890ff',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                {isLoading ? t.creating : t.createEvent}
              </button>
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

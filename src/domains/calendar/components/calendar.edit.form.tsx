import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, TimePicker, Switch, Card, Row, Col, Typography, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { UpdateCalendarEventData, EventTypeEnum, EVENT_TYPE_LABELS_BY_LANGUAGE } from '../types/calendar.types';
import { useCalendarEvent } from '../hooks/use-calendar.hook';
import { axiosInstance } from '../../../shared';
import dayjs from 'dayjs';
import { useLanguage } from '../../../shared/contexts/language.context';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CalendarEditFormProps {
  eventId: number;
  onSuccess?: () => void;
}

const CALENDAR_EDIT_FORM_TRANSLATIONS = {
  english: {
    documentTitle: "Edit Event | The Children's World",
    header: "Edit Event",
    updateSuccess: "Event updated successfully",
    updateError: "Error updating event",
    notFoundTitle: "Event Not Found",
    notFoundDesc: "Could not load the event or it does not exist.",
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
    saving: "Saving...",
    saveChanges: "Save Changes",
  },
  spanish: {
    documentTitle: "Editar evento | The Children's World",
    header: "Editar evento",
    updateSuccess: "Evento actualizado correctamente",
    updateError: "Error al actualizar evento",
    notFoundTitle: "Evento no encontrado",
    notFoundDesc: "No se pudo cargar el evento o no existe.",
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
    saving: "Guardando...",
    saveChanges: "Guardar cambios",
  },
} as const;

export const CalendarEditForm: React.FC<CalendarEditFormProps> = ({ eventId, onSuccess }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = CALENDAR_EDIT_FORM_TRANSLATIONS[language];
  const [form] = Form.useForm();
  const [isAllDay, setIsAllDay] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { event, isLoading, error } = useCalendarEvent(eventId);

  // Set document title
  useEffect(() => {
    document.title = t.documentTitle;
  }, [t.documentTitle]);

  // Update form when event data is loaded
  useEffect(() => {
    if (event) {
      setIsAllDay(event.isAllDay);
      
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

  const handleAllDayChange = (checked: boolean) => {
    setIsAllDay(checked);
    if (checked) {
      form.setFieldsValue({ startTime: undefined, endTime: undefined });
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      // Remove id from the request body since it's passed in the URL
      const eventData = {
        title: values.title,
        description: values.description,
        eventType: values.eventType,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        isAllDay: Boolean(isAllDay), // Ensure it's always a boolean
        startTime: isAllDay ? undefined : values.startTime?.format('HH:mm'),
        endTime: isAllDay ? undefined : values.endTime?.format('HH:mm'),
      };

      await axiosInstance.patch(`/calendar/events/${eventId}`, eventData);
      
      message.success(t.updateSuccess);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/calendar');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      message.error(t.updateError);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/calendar')}
          style={{ padding: '4px 0', display: 'flex', alignItems: 'center' }}
          aria-label={t.cancel}
        />
        <Title level={4} style={{ margin: 0 }}>
          {t.header}
        </Title>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
                format={language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY"}
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
                format={language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY"}
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
                  format="h:mm A"
                  use12Hours
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
                  format="h:mm A"
                  use12Hours
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
            <Button
              type="default"
              onClick={() => navigate('/calendar')}
            >
              {t.cancel}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
            >
              {isSubmitting ? t.saving : t.saveChanges}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, TimePicker, Switch, Card, Row, Col, Typography } from 'antd';
import { useCreate } from '@refinedev/core';
import { useNavigate } from 'react-router';
import { CreateCalendarEventData, EventTypeEnum, EVENT_TYPE_LABELS } from '../types/calendar.types';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Set Spanish locale for dayjs
dayjs.locale('es');

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CalendarCreateFormProps {
  onSuccess?: () => void;
}

export const CalendarCreateForm: React.FC<CalendarCreateFormProps> = ({ onSuccess }) => {
  console.log('🔍 CalendarCreateForm: Componente montado');
  
  const navigate = useNavigate();
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
        Crear Nuevo Evento
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
              label="Título del Evento"
              name="title"
              rules={[
                { required: true, message: 'Por favor ingrese el título del evento' },
                { max: 255, message: 'El título no puede exceder 255 caracteres' }
              ]}
            >
              <Input placeholder="Ingrese el título del evento" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tipo de Evento"
              name="eventType"
              rules={[{ required: true, message: 'Por favor seleccione el tipo de evento' }]}
            >
              <Select placeholder="Seleccione el tipo de evento">
                {Object.values(EventTypeEnum).map((type) => (
                  <Option key={type} value={type}>
                    {EVENT_TYPE_LABELS[type]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="Todo el día"
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
              label="Fecha de Inicio"
              name="startDate"
              rules={[{ required: true, message: 'Por favor seleccione la fecha de inicio' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Seleccione la fecha de inicio"
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="Fecha de Fin"
              name="endDate"
              rules={[{ required: true, message: 'Por favor seleccione la fecha de fin' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Seleccione la fecha de fin"
              />
            </Form.Item>
          </Col>
        </Row>

        {!isAllDay && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Hora de Inicio"
                name="startTime"
                rules={[{ required: true, message: 'Por favor seleccione la hora de inicio' }]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder="Seleccione la hora de inicio"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Hora de Fin"
                name="endTime"
                rules={[{ required: true, message: 'Por favor seleccione la hora de fin' }]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder="Seleccione la hora de fin"
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Descripción"
              name="description"
            >
              <TextArea 
                rows={4}
                placeholder="Ingrese una descripción del evento (opcional)"
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
                Cancelar
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
                {isLoading ? 'Creando...' : 'Crear Evento'}
              </button>
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

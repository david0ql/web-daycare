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
        Create New Event
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
              label="Event Title"
              name="title"
              rules={[
                { required: true, message: 'Please enter the event title' },
                { max: 255, message: 'Title cannot exceed 255 characters' }
              ]}
            >
              <Input placeholder="Enter event title" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Event Type"
              name="eventType"
              rules={[{ required: true, message: 'Please select the event type' }]}
            >
              <Select placeholder="Select event type">
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
              label="All Day"
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
              label="Start Date"
              name="startDate"
              rules={[{ required: true, message: 'Please select the start date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Select start date"
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="End Date"
              name="endDate"
              rules={[{ required: true, message: 'Please select the end date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Select end date"
              />
            </Form.Item>
          </Col>
        </Row>

        {!isAllDay && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Start Time"
                name="startTime"
                rules={[{ required: true, message: 'Please select the start time' }]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder="Select start time"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="End Time"
                name="endTime"
                rules={[{ required: true, message: 'Please select the end time' }]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder="Select end time"
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
            >
              <TextArea 
                rows={4}
                placeholder="Enter event description (optional)"
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
                Cancel
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
                {isLoading ? 'Creating...' : 'Create Event'}
              </button>
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

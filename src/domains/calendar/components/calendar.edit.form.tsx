import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, TimePicker, Switch, Card, Row, Col, Typography, Button, message } from 'antd';
import { useNavigate } from 'react-router';
import { UpdateCalendarEventData, EventTypeEnum, EVENT_TYPE_LABELS } from '../types/calendar.types';
import { useCalendarEvent } from '../hooks/use-calendar.hook';
import { axiosInstance } from '../../../shared';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Set Spanish locale for dayjs
dayjs.locale('es');

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CalendarEditFormProps {
  eventId: number;
  onSuccess?: () => void;
}

export const CalendarEditForm: React.FC<CalendarEditFormProps> = ({ eventId, onSuccess }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isAllDay, setIsAllDay] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { event, isLoading, error } = useCalendarEvent(eventId);

  // Set document title
  useEffect(() => {
    document.title = "Edit Event | The Children's World";
  }, []);

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
      
      message.success('Event updated successfully');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/calendar');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      message.error('Error updating event');
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
        <Title level={4}>Event Not Found</Title>
        <p>Could not load the event or it does not exist.</p>
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4} style={{ marginBottom: '24px' }}>
        Edit Event
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
            <Button
              type="default"
              onClick={() => navigate('/calendar')}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

import React, { useState } from 'react';
import { Form, Input, Select, Switch, Button, Card, Row, Col, Typography, message, TimePicker } from 'antd';
import { useDailyActivities } from '../hooks/use-daily-activities.hook';
import { CreateDailyActivityData, ActivityTypeEnum, ACTIVITY_TYPE_LABELS } from '../types/daily-activities.types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface DailyActivitiesCreateFormProps {
  childId: number;
  attendanceId: number;
  onSuccess?: () => void;
}

export const DailyActivitiesCreateForm: React.FC<DailyActivitiesCreateFormProps> = ({
  childId,
  attendanceId,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const { createActivity } = useDailyActivities();

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      const activityData: CreateDailyActivityData = {
        childId,
        attendanceId,
        activityType: values.activityType,
        completed: completed,
        timeCompleted: completed && values.timeCompleted ? values.timeCompleted.toDate() : undefined,
        notes: values.notes,
      };

      await createActivity(activityData);
      
      message.success('Activity registered successfully');
      form.resetFields();
      setCompleted(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      message.error('Error registering activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompletedChange = (checked: boolean) => {
    setCompleted(checked);
    if (!checked) {
      form.setFieldsValue({ timeCompleted: undefined });
    }
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: '16px' }}>
        Register Daily Activity
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          completed: false,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Activity Type"
              name="activityType"
              rules={[{ required: true, message: 'Please select the activity type' }]}
            >
              <Select placeholder="Select activity type">
                {Object.values(ActivityTypeEnum).map((type) => (
                  <Option key={type} value={type}>
                    {ACTIVITY_TYPE_LABELS[type]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="Completed"
              name="completed"
              valuePropName="checked"
              getValueFromEvent={(checked) => Boolean(checked)}
              getValueProps={(value) => ({ value: Boolean(value) })}
            >
              <Switch 
                checked={completed}
                onChange={handleCompletedChange}
              />
            </Form.Item>
          </Col>
        </Row>

        {completed && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Completion Time"
                name="timeCompleted"
                rules={[{ required: true, message: 'Please select the completion time' }]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder="Select time"
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Notes"
              name="notes"
            >
              <TextArea 
                rows={3}
                placeholder="Additional notes about the activity (optional)"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
          >
            {isSubmitting ? 'Registering...' : 'Register Activity'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

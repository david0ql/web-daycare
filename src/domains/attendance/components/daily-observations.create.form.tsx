import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, Typography, message, Space } from 'antd';
import { useDailyObservations } from '../hooks/use-daily-observations.hook';
import { CreateDailyObservationData, MoodEnum, MOOD_LABELS, MOOD_ICONS } from '../types/daily-observations.types';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface DailyObservationsCreateFormProps {
  childId: number;
  attendanceId: number;
  onSuccess?: () => void;
}

export const DailyObservationsCreateForm: React.FC<DailyObservationsCreateFormProps> = ({
  childId,
  attendanceId,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createObservation } = useDailyObservations();

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      const observationData: CreateDailyObservationData = {
        childId,
        attendanceId,
        mood: values.mood,
        generalObservations: values.generalObservations,
      };

      await createObservation(observationData);
      
      message.success('Observation registered successfully');
      form.resetFields();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating observation:', error);
      message.error('Error registering observation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: '16px' }}>
        Register Daily Observation
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mood"
              name="mood"
              rules={[{ required: true, message: 'Please select the mood' }]}
            >
              <Select placeholder="Select mood">
                {Object.values(MoodEnum).map((mood) => (
                  <Option key={mood} value={mood}>
                    <Space>
                      <span style={{ fontSize: '16px' }}>{MOOD_ICONS[mood]}</span>
                      {MOOD_LABELS[mood]}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="General Observations"
              name="generalObservations"
              rules={[{ required: true, message: 'Please enter the observations' }]}
            >
              <TextArea 
                rows={4}
                placeholder="Describe the child's behavior, activities, interactions, and any relevant observations..."
                maxLength={1000}
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
            {isSubmitting ? 'Registering...' : 'Register Observation'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

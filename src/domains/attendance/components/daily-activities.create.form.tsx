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
      
      message.success('Actividad registrada exitosamente');
      form.resetFields();
      setCompleted(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      message.error('Error al registrar la actividad');
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
        Registrar Actividad Diaria
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
              label="Tipo de Actividad"
              name="activityType"
              rules={[{ required: true, message: 'Por favor seleccione el tipo de actividad' }]}
            >
              <Select placeholder="Seleccione el tipo de actividad">
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
              label="Completada"
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
                label="Hora de Completado"
                name="timeCompleted"
                rules={[{ required: true, message: 'Por favor seleccione la hora de completado' }]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder="Seleccione la hora"
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Notas"
              name="notes"
            >
              <TextArea 
                rows={3}
                placeholder="Notas adicionales sobre la actividad (opcional)"
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
            {isSubmitting ? 'Registrando...' : 'Registrar Actividad'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

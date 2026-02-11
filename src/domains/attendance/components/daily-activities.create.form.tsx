import React, { useState } from 'react';
import { Form, Input, Select, Switch, Button, Card, Row, Col, Typography, message, TimePicker } from 'antd';
import { useDailyActivities } from '../hooks/use-daily-activities.hook';
import { CreateDailyActivityData, ActivityTypeEnum, ACTIVITY_TYPE_LABELS_BY_LANGUAGE } from '../types/daily-activities.types';
import dayjs from 'dayjs';
import { useLanguage } from '../../../shared/contexts/language.context';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface DailyActivitiesCreateFormProps {
  childId: number;
  attendanceId: number;
  onSuccess?: () => void;
}

const DAILY_ACTIVITIES_CREATE_TRANSLATIONS = {
  english: {
    title: "Register Daily Activity",
    activityType: "Activity Type",
    activityTypeRequired: "Please select the activity type",
    activityTypePlaceholder: "Select activity type",
    completed: "Completed",
    completionTime: "Completion Time",
    completionTimeRequired: "Please select the completion time",
    selectTime: "Select time",
    notes: "Notes",
    notesPlaceholder: "Additional notes about the activity (optional)",
    registering: "Registering...",
    registerActivity: "Register Activity",
    success: "Activity registered successfully",
    error: "Error registering activity",
  },
  spanish: {
    title: "Registrar actividad diaria",
    activityType: "Tipo de actividad",
    activityTypeRequired: "Por favor selecciona el tipo de actividad",
    activityTypePlaceholder: "Selecciona tipo de actividad",
    completed: "Completado",
    completionTime: "Hora de finalización",
    completionTimeRequired: "Por favor selecciona la hora de finalización",
    selectTime: "Selecciona hora",
    notes: "Notas",
    notesPlaceholder: "Notas adicionales sobre la actividad (opcional)",
    registering: "Registrando...",
    registerActivity: "Registrar actividad",
    success: "Actividad registrada correctamente",
    error: "Error al registrar actividad",
  },
} as const;

export const DailyActivitiesCreateForm: React.FC<DailyActivitiesCreateFormProps> = ({
  childId,
  attendanceId,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const t = DAILY_ACTIVITIES_CREATE_TRANSLATIONS[language];
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
      
      message.success(t.success);
      form.resetFields();
      setCompleted(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      message.error(t.error);
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
        {t.title}
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
              label={t.activityType}
              name="activityType"
              rules={[{ required: true, message: t.activityTypeRequired }]}
            >
              <Select placeholder={t.activityTypePlaceholder}>
                {Object.values(ActivityTypeEnum).map((type) => (
                  <Option key={type} value={type}>
                    {ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][type]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label={t.completed}
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
                label={t.completionTime}
                name="timeCompleted"
                rules={[{ required: true, message: t.completionTimeRequired }]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  format="HH:mm"
                  placeholder={t.selectTime}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t.notes}
              name="notes"
            >
              <TextArea 
                rows={3}
                placeholder={t.notesPlaceholder}
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
            {isSubmitting ? t.registering : t.registerActivity}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

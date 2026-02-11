import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, Typography, message, Space } from 'antd';
import { useDailyObservations } from '../hooks/use-daily-observations.hook';
import { CreateDailyObservationData, MoodEnum, MOOD_LABELS_BY_LANGUAGE, MOOD_ICONS } from '../types/daily-observations.types';
import { useLanguage } from '../../../shared/contexts/language.context';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface DailyObservationsCreateFormProps {
  childId: number;
  attendanceId: number;
  onSuccess?: () => void;
}

const DAILY_OBSERVATIONS_CREATE_TRANSLATIONS = {
  english: {
    title: "Register Daily Observation",
    mood: "Mood",
    moodRequired: "Please select the mood",
    moodPlaceholder: "Select mood",
    generalObservations: "General Observations",
    observationsRequired: "Please enter the observations",
    observationsPlaceholder: "Describe the child's behavior, activities, interactions, and any relevant observations...",
    registering: "Registering...",
    registerObservation: "Register Observation",
    success: "Observation registered successfully",
    error: "Error registering observation",
  },
  spanish: {
    title: "Registrar observación diaria",
    mood: "Estado de ánimo",
    moodRequired: "Por favor selecciona el estado de ánimo",
    moodPlaceholder: "Selecciona estado de ánimo",
    generalObservations: "Observaciones generales",
    observationsRequired: "Por favor ingresa las observaciones",
    observationsPlaceholder: "Describe el comportamiento del niño, actividades, interacciones y cualquier observación relevante...",
    registering: "Registrando...",
    registerObservation: "Registrar observación",
    success: "Observación registrada correctamente",
    error: "Error al registrar observación",
  },
} as const;

export const DailyObservationsCreateForm: React.FC<DailyObservationsCreateFormProps> = ({
  childId,
  attendanceId,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const t = DAILY_OBSERVATIONS_CREATE_TRANSLATIONS[language];
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
      
      message.success(t.success);
      form.resetFields();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating observation:', error);
      message.error(t.error);
    } finally {
      setIsSubmitting(false);
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
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.mood}
              name="mood"
              rules={[{ required: true, message: t.moodRequired }]}
            >
              <Select placeholder={t.moodPlaceholder}>
                {Object.values(MoodEnum).map((mood) => (
                  <Option key={mood} value={mood}>
                    <Space>
                      <span style={{ fontSize: '16px' }}>{MOOD_ICONS[mood]}</span>
                      {MOOD_LABELS_BY_LANGUAGE[language][mood]}
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
              label={t.generalObservations}
              name="generalObservations"
              rules={[{ required: true, message: t.observationsRequired }]}
            >
              <TextArea 
                rows={4}
                placeholder={t.observationsPlaceholder}
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
            {isSubmitting ? t.registering : t.registerObservation}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

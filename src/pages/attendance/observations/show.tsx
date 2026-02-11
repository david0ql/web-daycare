import React from "react";
import { Show, DateField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Tag, Space } from "antd";
import { MoodEnum, MOOD_ICONS, MOOD_COLORS, MOOD_LABELS_BY_LANGUAGE } from "../../../domains/attendance/types/daily-observations.types";
import { useLanguage } from "../../../shared/contexts/language.context";

const { Title, Text } = Typography;

const ATTENDANCE_OBSERVATIONS_SHOW_TRANSLATIONS = {
  english: {
    observationInformation: "Observation Information",
    childInformation: "Child Information",
    child: "Child",
    id: "ID",
    mood: "Mood",
    status: "Status",
    date: "Date",
    observations: "Observations",
    generalObservations: "General Observations",
    additionalInformation: "Additional Information",
    registeredBy: "Registered by",
    created: "Created",
  },
  spanish: {
    observationInformation: "Información de la observación",
    childInformation: "Información del niño",
    child: "Niño",
    id: "ID",
    mood: "Ánimo",
    status: "Estado",
    date: "Fecha",
    observations: "Observaciones",
    generalObservations: "Observaciones generales",
    additionalInformation: "Información adicional",
    registeredBy: "Registrado por",
    created: "Creado",
  },
} as const;

export const AttendanceObservationsShow: React.FC = () => {
  const { data, isLoading } = useShow() as any;
  const record = data?.data;
  const { language } = useLanguage();
  const t = ATTENDANCE_OBSERVATIONS_SHOW_TRANSLATIONS[language];

  const getMoodTag = (mood: string) => {
    const moodKey = mood as MoodEnum;
    return (
      <Tag 
        color={MOOD_COLORS[mood as keyof typeof MOOD_COLORS]}
        icon={<span style={{ fontSize: '14px' }}>{MOOD_ICONS[mood as keyof typeof MOOD_ICONS]}</span>}
      >
        {MOOD_LABELS_BY_LANGUAGE[language][moodKey]}
      </Tag>
    );
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{t.observationInformation}</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title={t.childInformation} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.child}: </Text>
                <Text>{record?.child?.firstName} {record?.child?.lastName}</Text>
              </div>
              <div>
                <Text strong>{t.id}: </Text>
                <Text>{record?.childId}</Text>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title={t.mood} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.status}: </Text>
                {getMoodTag(record?.mood)}
              </div>
              <div>
                <Text strong>{t.date}: </Text>
                <DateField value={record?.attendance?.attendanceDate} format="DD/MM/YYYY" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={t.observations} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.generalObservations}: </Text>
                <Text>{record?.generalObservations}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={t.additionalInformation} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.registeredBy}: </Text>
                <Text>{record?.createdByUser?.firstName} {record?.createdByUser?.lastName}</Text>
              </div>
              <div>
                <Text strong>{t.created}: </Text>
                <DateField value={record?.createdAt} format="DD/MM/YYYY HH:mm" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};

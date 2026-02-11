import React from "react";
import { Show, DateField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Tag, Space } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { ActivityTypeEnum, ACTIVITY_TYPE_LABELS_BY_LANGUAGE, ACTIVITY_TYPE_ICONS } from "../../../domains/attendance/types/daily-activities.types";
import dayjs from 'dayjs';
import { useLanguage } from "../../../shared/contexts/language.context";

const { Title, Text } = Typography;

const ATTENDANCE_ACTIVITIES_SHOW_TRANSLATIONS = {
  english: {
    activityInformation: "Activity Information",
    childInformation: "Child Information",
    child: "Child",
    id: "ID",
    activityStatus: "Activity Status",
    status: "Status",
    date: "Date",
    pending: "Pending",
    completed: "Completed",
    activityDetails: "Activity Details",
    type: "Type",
    completionTime: "Completion Time",
    additionalInformation: "Additional Information",
    notes: "Notes",
    noNotes: "No notes",
    registeredBy: "Registered by",
    created: "Created",
  },
  spanish: {
    activityInformation: "Información de la actividad",
    childInformation: "Información del niño",
    child: "Niño",
    id: "ID",
    activityStatus: "Estado de la actividad",
    status: "Estado",
    date: "Fecha",
    pending: "Pendiente",
    completed: "Completado",
    activityDetails: "Detalles de la actividad",
    type: "Tipo",
    completionTime: "Hora de finalización",
    additionalInformation: "Información adicional",
    notes: "Notas",
    noNotes: "Sin notas",
    registeredBy: "Registrado por",
    created: "Creado",
  },
} as const;

export const AttendanceActivitiesShow: React.FC = () => {
  const { data, isLoading } = useShow() as any;
  const record = data?.data;
  const { language } = useLanguage();
  const t = ATTENDANCE_ACTIVITIES_SHOW_TRANSLATIONS[language];

  const getActivityStatus = () => {
    if (!record?.completed) {
      return (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          {t.pending}
        </Tag>
      );
    }
    return (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        {t.completed}
      </Tag>
    );
  };

  const getTimeCompleted = () => {
    if (record?.completed && record?.timeCompleted) {
      return dayjs(record.timeCompleted).format('HH:mm');
    }
    return null;
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{t.activityInformation}</Title>
      
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
          <Card title={t.activityStatus} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.status}: </Text>
                {getActivityStatus()}
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
        <Col span={12}>
          <Card title={t.activityDetails} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.type}: </Text>
	                <Space>
	                  <span style={{ fontSize: '16px' }}>
	                    {ACTIVITY_TYPE_ICONS[record?.activityType as keyof typeof ACTIVITY_TYPE_ICONS]}
	                  </span>
	                  {record?.activityType ? ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][record.activityType as ActivityTypeEnum] : "-"}
	                </Space>
	              </div>
              {record?.completed && record?.timeCompleted && (
                <div>
                  <Text strong>{t.completionTime}: </Text>
                  <Text>{getTimeCompleted()}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title={t.additionalInformation} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.notes}: </Text>
                <Text>{record?.notes || t.noNotes}</Text>
              </div>
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

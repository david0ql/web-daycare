import React from "react";
import { Show, DateField, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Tag, Avatar, Space, Divider } from "antd";
import { UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { AttendanceDetailsTabs } from "../../domains/attendance";
import { useLanguage } from "../../shared/contexts/language.context";
import { getIntlLocale } from "../../shared/i18n/locale";

const { Title, Text } = Typography;

const ATTENDANCE_SHOW_TRANSLATIONS = {
  english: {
    title: "Attendance Details",
    infoTitle: "Attendance Information",
    childInfo: "Child Information",
    attendanceStatus: "Attendance Status",
    status: "Status",
    date: "Date",
    schedule: "Schedule",
    checkInTime: "Check-in Time",
    checkOutTime: "Check-out Time",
    notRecorded: "Not recorded",
    responsiblePersons: "Responsible Persons",
    deliveredBy: "Delivered by",
    pickedUpBy: "Picked up by",
    notSpecified: "Not specified",
    notes: "Notes",
    checkInNotes: "Check-in Notes",
    checkOutNotes: "Check-out Notes",
    noNotes: "No notes",
    id: "ID",
    absent: "Absent",
    checkedOut: "Checked Out",
    present: "Present",
    presentNoCheckIn: "Present (No check-in)",
  },
  spanish: {
    title: "Detalles de asistencia",
    infoTitle: "Información de asistencia",
    childInfo: "Información del niño",
    attendanceStatus: "Estado de asistencia",
    status: "Estado",
    date: "Fecha",
    schedule: "Horario",
    checkInTime: "Hora de entrada",
    checkOutTime: "Hora de salida",
    notRecorded: "No registrada",
    responsiblePersons: "Personas responsables",
    deliveredBy: "Entregado por",
    pickedUpBy: "Recogido por",
    notSpecified: "No especificado",
    notes: "Notas",
    checkInNotes: "Notas de entrada",
    checkOutNotes: "Notas de salida",
    noNotes: "Sin notas",
    id: "ID",
    absent: "Ausente",
    checkedOut: "Retirado",
    present: "Presente",
    presentNoCheckIn: "Presente (sin entrada)",
  },
} as const;

export const AttendanceShow: React.FC = () => {
  const { language } = useLanguage();
  const t = ATTENDANCE_SHOW_TRANSLATIONS[language];
  const intlLocale = getIntlLocale(language);
  const { data, isLoading } = useShow() as any;
  const record = data?.data;

  const getStatusTag = () => {
    if (!record?.isPresent) {
      return (
        <Tag color="red" icon={<CloseCircleOutlined />}>
          {t.absent}
        </Tag>
      );
    }

    if (record?.checkOutTime) {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          {t.checkedOut}
        </Tag>
      );
    }

    if (record?.checkInTime) {
      return (
        <Tag color="blue" icon={<ClockCircleOutlined />}>
          {t.present}
        </Tag>
      );
    }

    return (
      <Tag color="orange">
        {t.presentNoCheckIn}
      </Tag>
    );
  };

  return (
    <Show title={t.title} isLoading={isLoading}>
      <Title level={5}>{t.infoTitle}</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title={t.childInfo} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Avatar 
                  src={record?.child?.profilePicture} 
                  icon={<UserOutlined />}
                  size="large"
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong>{record?.child?.firstName} {record?.child?.lastName}</Text>
                  <br />
                  <Text type="secondary">{t.id}: {record?.childId}</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title={t.attendanceStatus} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.status}: </Text>
                {getStatusTag()}
              </div>
              <div>
                <Text strong>{t.date}: </Text>
                <DateField value={record?.attendanceDate} format="DD/MM/YYYY" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col span={12}>
          <Card title={t.schedule} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.checkInTime}: </Text>
                {record?.checkInTime ? (
                  <Text>{new Date(record.checkInTime).toLocaleTimeString(intlLocale, { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</Text>
                ) : (
                  <Text type="secondary">{t.notRecorded}</Text>
                )}
              </div>
              <div>
                <Text strong>{t.checkOutTime}: </Text>
                {record?.checkOutTime ? (
                  <Text>{new Date(record.checkOutTime).toLocaleTimeString(intlLocale, { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</Text>
                ) : (
                  <Text type="secondary">{t.notRecorded}</Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title={t.responsiblePersons} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.deliveredBy}: </Text>
                {record?.deliveredBy2 ? (
                  <div>
                    <Text>{record.deliveredBy2.name}</Text>
                    <br />
                    <Text type="secondary">
                      {record.deliveredBy2.relationship} - {record.deliveredBy2.phone}
                    </Text>
                  </div>
                ) : (
                  <Text type="secondary">{t.notSpecified}</Text>
                )}
              </div>
              <div>
                <Text strong>{t.pickedUpBy}: </Text>
                {record?.pickedUpBy2 ? (
                  <div>
                    <Text>{record.pickedUpBy2.name}</Text>
                    <br />
                    <Text type="secondary">
                      {record.pickedUpBy2.relationship} - {record.pickedUpBy2.phone}
                    </Text>
                  </div>
                ) : (
                  <Text type="secondary">{t.notSpecified}</Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col span={24}>
          <Card title={t.notes} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.checkInNotes}: </Text>
                {record?.checkInNotes ? (
                  <Text>{record.checkInNotes}</Text>
                ) : (
                  <Text type="secondary">{t.noNotes}</Text>
                )}
              </div>
              <div>
                <Text strong>{t.checkOutNotes}: </Text>
                {record?.checkOutNotes ? (
                  <Text>{record.checkOutNotes}</Text>
                ) : (
                  <Text type="secondary">{t.noNotes}</Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Daily Activities, Observations, and Photos */}
      {record?.childId && record?.id && (
        <AttendanceDetailsTabs
          childId={record.childId}
          attendanceId={record.id}
        />
      )}
    </Show>
  );
};

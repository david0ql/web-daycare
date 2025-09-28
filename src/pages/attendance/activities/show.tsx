import React from "react";
import { Show, DateField, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Tag, Space } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_ICONS } from "../../../domains/attendance/types/daily-activities.types";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const AttendanceActivitiesShow: React.FC = () => {
  const { data, isLoading } = useShow();
  const record = data?.data;

  const getActivityStatus = () => {
    if (!record?.completed) {
      return (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          Pendiente
        </Tag>
      );
    }
    return (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        Completada
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
      <Title level={5}>Información de Actividad</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Información del Niño" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Niño: </Text>
                <Text>{record?.child?.firstName} {record?.child?.lastName}</Text>
              </div>
              <div>
                <Text strong>ID: </Text>
                <Text>{record?.childId}</Text>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Estado de Actividad" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Estado: </Text>
                {getActivityStatus()}
              </div>
              <div>
                <Text strong>Fecha: </Text>
                <DateField value={record?.attendance?.attendanceDate} format="DD/MM/YYYY" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Detalles de la Actividad" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Tipo: </Text>
                <Space>
                  <span style={{ fontSize: '16px' }}>
                    {ACTIVITY_TYPE_ICONS[record?.activityType as keyof typeof ACTIVITY_TYPE_ICONS]}
                  </span>
                  {ACTIVITY_TYPE_LABELS[record?.activityType as keyof typeof ACTIVITY_TYPE_LABELS]}
                </Space>
              </div>
              {record?.completed && record?.timeCompleted && (
                <div>
                  <Text strong>Hora Completado: </Text>
                  <Text>{getTimeCompleted()}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Información Adicional" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Notas: </Text>
                <Text>{record?.notes || 'Sin notas'}</Text>
              </div>
              <div>
                <Text strong>Registrado por: </Text>
                <Text>{record?.createdByUser?.firstName} {record?.createdByUser?.lastName}</Text>
              </div>
              <div>
                <Text strong>Creado: </Text>
                <DateField value={record?.createdAt} format="DD/MM/YYYY HH:mm" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};

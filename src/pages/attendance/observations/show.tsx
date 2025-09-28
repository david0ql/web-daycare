import React from "react";
import { Show, DateField, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Tag, Space } from "antd";
import { MOOD_LABELS, MOOD_ICONS, MOOD_COLORS } from "../../../domains/attendance/types/daily-observations.types";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const AttendanceObservationsShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const getMoodTag = (mood: string) => {
    return (
      <Tag 
        color={MOOD_COLORS[mood as keyof typeof MOOD_COLORS]}
        icon={<span style={{ fontSize: '14px' }}>{MOOD_ICONS[mood as keyof typeof MOOD_ICONS]}</span>}
      >
        {MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}
      </Tag>
    );
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Información de Observación</Title>
      
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
          <Card title="Estado de Ánimo" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Estado: </Text>
                {getMoodTag(record?.mood)}
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
        <Col span={24}>
          <Card title="Observaciones" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Observaciones Generales: </Text>
                <Text>{record?.generalObservations}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Información Adicional" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
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

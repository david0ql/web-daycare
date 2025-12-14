import React from "react";
import { Show, DateField, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Tag, Space } from "antd";
import { MOOD_LABELS, MOOD_ICONS, MOOD_COLORS } from "../../../domains/attendance/types/daily-observations.types";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const AttendanceObservationsShow: React.FC = () => {
  const { data, isLoading } = useShow() as any;
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
      <Title level={5}>Observation Information</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Child Information" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Child: </Text>
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
          <Card title="Mood" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Status: </Text>
                {getMoodTag(record?.mood)}
              </div>
              <div>
                <Text strong>Date: </Text>
                <DateField value={record?.attendance?.attendanceDate} format="DD/MM/YYYY" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Observations" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>General Observations: </Text>
                <Text>{record?.generalObservations}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Additional Information" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Registered by: </Text>
                <Text>{record?.createdByUser?.firstName} {record?.createdByUser?.lastName}</Text>
              </div>
              <div>
                <Text strong>Created: </Text>
                <DateField value={record?.createdAt} format="DD/MM/YYYY HH:mm" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};

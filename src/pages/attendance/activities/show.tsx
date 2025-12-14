import React from "react";
import { Show, DateField, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Tag, Space } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_ICONS } from "../../../domains/attendance/types/daily-activities.types";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const AttendanceActivitiesShow: React.FC = () => {
  const { data, isLoading } = useShow() as any;
  const record = data?.data;

  const getActivityStatus = () => {
    if (!record?.completed) {
      return (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          Pending
        </Tag>
      );
    }
    return (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        Completed
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
      <Title level={5}>Activity Information</Title>
      
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
          <Card title="Activity Status" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Status: </Text>
                {getActivityStatus()}
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
        <Col span={12}>
          <Card title="Activity Details" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Type: </Text>
                <Space>
                  <span style={{ fontSize: '16px' }}>
                    {ACTIVITY_TYPE_ICONS[record?.activityType as keyof typeof ACTIVITY_TYPE_ICONS]}
                  </span>
                  {ACTIVITY_TYPE_LABELS[record?.activityType as keyof typeof ACTIVITY_TYPE_LABELS]}
                </Space>
              </div>
              {record?.completed && record?.timeCompleted && (
                <div>
                  <Text strong>Completion Time: </Text>
                  <Text>{getTimeCompleted()}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Additional Information" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Notes: </Text>
                <Text>{record?.notes || 'No notes'}</Text>
              </div>
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

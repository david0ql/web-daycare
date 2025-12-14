import React from "react";
import { Show, DateField, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Tag, Avatar, Space, Divider } from "antd";
import { UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { AttendanceDetailsTabs } from "../../domains/attendance";

const { Title, Text } = Typography;

export const AttendanceShow: React.FC = () => {
  const { data, isLoading } = useShow() as any;
  const record = data?.data;

  const getStatusTag = () => {
    if (!record?.isPresent) {
      return (
        <Tag color="red" icon={<CloseCircleOutlined />}>
          Absent
        </Tag>
      );
    }

    if (record?.checkOutTime) {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Checked Out
        </Tag>
      );
    }

    if (record?.checkInTime) {
      return (
        <Tag color="blue" icon={<ClockCircleOutlined />}>
          Present
        </Tag>
      );
    }

    return (
      <Tag color="orange">
        Present (No check-in)
      </Tag>
    );
  };

  return (
    <Show title="Attendance Details" isLoading={isLoading}>
      <Title level={5}>Attendance Information</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Child Information" size="small">
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
                  <Text type="secondary">ID: {record?.childId}</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Attendance Status" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Status: </Text>
                {getStatusTag()}
              </div>
              <div>
                <Text strong>Date: </Text>
                <DateField value={record?.attendanceDate} format="DD/MM/YYYY" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Schedule" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Check-in Time: </Text>
                {record?.checkInTime ? (
                  <Text>{new Date(record.checkInTime).toLocaleTimeString('es-CO', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</Text>
                ) : (
                  <Text type="secondary">No registrada</Text>
                )}
              </div>
              <div>
                <Text strong>Check-out Time: </Text>
                {record?.checkOutTime ? (
                  <Text>{new Date(record.checkOutTime).toLocaleTimeString('es-CO', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</Text>
                ) : (
                  <Text type="secondary">No registrada</Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Responsible Persons" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Delivered by: </Text>
                {record?.deliveredBy2 ? (
                  <div>
                    <Text>{record.deliveredBy2.name}</Text>
                    <br />
                    <Text type="secondary">
                      {record.deliveredBy2.relationship} - {record.deliveredBy2.phone}
                    </Text>
                  </div>
                ) : (
                  <Text type="secondary">No especificado</Text>
                )}
              </div>
              <div>
                <Text strong>Picked up by: </Text>
                {record?.pickedUpBy2 ? (
                  <div>
                    <Text>{record.pickedUpBy2.name}</Text>
                    <br />
                    <Text type="secondary">
                      {record.pickedUpBy2.relationship} - {record.pickedUpBy2.phone}
                    </Text>
                  </div>
                ) : (
                  <Text type="secondary">No especificado</Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col span={24}>
          <Card title="Notes" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Check-in Notes: </Text>
                {record?.checkInNotes ? (
                  <Text>{record.checkInNotes}</Text>
                ) : (
                  <Text type="secondary">Sin notas</Text>
                )}
              </div>
              <div>
                <Text strong>Check-out Notes: </Text>
                {record?.checkOutNotes ? (
                  <Text>{record.checkOutNotes}</Text>
                ) : (
                  <Text type="secondary">Sin notas</Text>
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

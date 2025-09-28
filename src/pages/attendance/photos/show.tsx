import React from "react";
import { Show, DateField, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Space, Image } from "antd";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const AttendancePhotosShow: React.FC = () => {
  const { data, isLoading } = useShow() as any;
  const record = data?.data;

  const getImageUrl = (record: any) => {
    return `https://api.thechildrenworld.com/api/uploads/activity-photos/${record.filename}`;
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Información de Foto de Actividad</Title>
      
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
          <Card title="Información de la Foto" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Fecha: </Text>
                <DateField value={record?.attendance?.attendanceDate} format="DD/MM/YYYY" />
              </div>
              <div>
                <Text strong>Subido por: </Text>
                <Text>{record?.uploadedByUser?.firstName} {record?.uploadedByUser?.lastName}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Foto" size="small">
            <div style={{ textAlign: 'center' }}>
              <Image
                width={400}
                height={300}
                src={getImageUrl(record)}
                style={{ objectFit: 'cover', borderRadius: 8 }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Descripción" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Descripción: </Text>
                <Text>{record?.caption || 'Sin descripción'}</Text>
              </div>
              <div>
                <Text strong>Archivo: </Text>
                <Text>{record?.filename}</Text>
              </div>
              <div>
                <Text strong>Subido: </Text>
                <DateField value={record?.createdAt} format="DD/MM/YYYY HH:mm" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};

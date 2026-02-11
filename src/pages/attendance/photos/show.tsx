import React from "react";
import { Show, DateField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Row, Col, Space, Image } from "antd";
import { useLanguage } from "../../../shared/contexts/language.context";

const { Title, Text } = Typography;

const ATTENDANCE_PHOTOS_SHOW_TRANSLATIONS = {
  english: {
    activityPhotoInformation: "Activity Photo Information",
    childInformation: "Child Information",
    child: "Child",
    id: "ID",
    photoInformation: "Photo Information",
    date: "Date",
    uploadedBy: "Uploaded by",
    photo: "Photo",
    description: "Description",
    noDescription: "No description",
    file: "File",
    uploaded: "Uploaded",
  },
  spanish: {
    activityPhotoInformation: "Información de la foto",
    childInformation: "Información del niño",
    child: "Niño",
    id: "ID",
    photoInformation: "Información de la foto",
    date: "Fecha",
    uploadedBy: "Subido por",
    photo: "Foto",
    description: "Descripción",
    noDescription: "Sin descripción",
    file: "Archivo",
    uploaded: "Subido",
  },
} as const;

export const AttendancePhotosShow: React.FC = () => {
  const { data, isLoading } = useShow() as any;
  const record = data?.data;
  const { language } = useLanguage();
  const t = ATTENDANCE_PHOTOS_SHOW_TRANSLATIONS[language];

  const getImageUrl = (record: any) => {
    return `https://api.thechildrenworld.com/api/uploads/activity-photos/${record.filename}`;
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{t.activityPhotoInformation}</Title>
      
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
          <Card title={t.photoInformation} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.date}: </Text>
                <DateField value={record?.attendance?.attendanceDate} format="DD/MM/YYYY" />
              </div>
              <div>
                <Text strong>{t.uploadedBy}: </Text>
                <Text>{record?.uploadedByUser?.firstName} {record?.uploadedByUser?.lastName}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={t.photo} size="small">
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
          <Card title={t.description} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t.description}: </Text>
                <Text>{record?.caption || t.noDescription}</Text>
              </div>
              <div>
                <Text strong>{t.file}: </Text>
                <Text>{record?.filename}</Text>
              </div>
              <div>
                <Text strong>{t.uploaded}: </Text>
                <DateField value={record?.createdAt} format="DD/MM/YYYY HH:mm" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};

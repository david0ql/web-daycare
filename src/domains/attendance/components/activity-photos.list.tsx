import React from 'react';
import { Card, Typography, Space, Button, Popconfirm, message, Empty, Image, Row, Col } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useActivityPhotos } from '../hooks/use-activity-photos.hook';
import { ActivityPhoto } from '../types/activity-photos.types';
import dayjs from 'dayjs';
import { useLanguage } from '../../../shared/contexts/language.context';

const { Title, Text } = Typography;

interface ActivityPhotosListProps {
  attendanceId: number;
}

const ACTIVITY_PHOTOS_LIST_TRANSLATIONS = {
  english: {
    deletedSuccess: "Photo deleted successfully",
    deleteError: "Error deleting photo",
    empty: "No photos registered for this day",
    title: "Activity Photos",
    activityPhotoAlt: "Activity photo",
    view: "View",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this photo?",
    yes: "Yes",
    no: "No",
    noDescription: "No description",
    uploadedBy: "Uploaded by",
  },
  spanish: {
    deletedSuccess: "Foto eliminada correctamente",
    deleteError: "Error al eliminar foto",
    empty: "No hay fotos registradas para este día",
    title: "Fotos de actividades",
    activityPhotoAlt: "Foto de actividad",
    view: "Ver",
    delete: "Eliminar",
    deleteConfirm: "¿Está seguro de eliminar esta foto?",
    yes: "Sí",
    no: "No",
    noDescription: "Sin descripción",
    uploadedBy: "Subido por",
  },
} as const;

export const ActivityPhotosList: React.FC<ActivityPhotosListProps> = ({
  attendanceId,
}) => {
  const { language } = useLanguage();
  const t = ACTIVITY_PHOTOS_LIST_TRANSLATIONS[language];
  const { photos, isLoading, deletePhoto } = useActivityPhotos(attendanceId);

  const handleDelete = async (id: number) => {
    try {
      await deletePhoto(id);
      message.success(t.deletedSuccess);
    } catch (error) {
      console.error('Error deleting photo:', error);
      message.error(t.deleteError);
    }
  };

  const getImageUrl = (photo: ActivityPhoto) => {
    // Assuming the API serves images from a static route
    return `https://api.thechildrenworld.com/uploads/activity-photos/${photo.filename}`;
  };

  if (isLoading) {
    return <Card loading />;
  }

  if (photos.length === 0) {
    return (
      <Card>
        <Empty 
          description={t.empty}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={5} style={{ marginBottom: '16px' }}>
        {t.title} ({photos.length})
      </Title>
      
      <Row gutter={[16, 16]}>
        {photos.map((photo) => (
          <Col xs={24} sm={12} md={8} lg={6} key={photo.id}>
            <Card
              hoverable
              cover={
                <Image
                  alt={photo.caption || t.activityPhotoAlt}
                  src={getImageUrl(photo)}
                  style={{ height: 200, objectFit: 'cover' }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
              }
              actions={[
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  size="small"
                >
                  {t.view}
                </Button>,
                <Popconfirm
                  title={t.deleteConfirm}
                  onConfirm={() => handleDelete(photo.id)}
                  okText={t.yes}
                  cancelText={t.no}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    {t.delete}
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={
                  <Text strong style={{ fontSize: '12px' }}>
                    {photo.caption || t.noDescription}
                  </Text>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {t.uploadedBy}: {photo.uploadedByUser?.firstName} {photo.uploadedByUser?.lastName}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {dayjs(photo.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

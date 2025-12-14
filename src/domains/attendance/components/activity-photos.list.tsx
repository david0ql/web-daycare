import React from 'react';
import { Card, Typography, Space, Button, Popconfirm, message, Empty, Image, Row, Col } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useActivityPhotos } from '../hooks/use-activity-photos.hook';
import { ActivityPhoto } from '../types/activity-photos.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ActivityPhotosListProps {
  attendanceId: number;
}

export const ActivityPhotosList: React.FC<ActivityPhotosListProps> = ({
  attendanceId,
}) => {
  const { photos, isLoading, deletePhoto } = useActivityPhotos(attendanceId);

  const handleDelete = async (id: number) => {
    try {
      await deletePhoto(id);
      message.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      message.error('Error deleting photo');
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
          description="No photos registered for this day"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={5} style={{ marginBottom: '16px' }}>
        Activity Photos ({photos.length})
      </Title>
      
      <Row gutter={[16, 16]}>
        {photos.map((photo) => (
          <Col xs={24} sm={12} md={8} lg={6} key={photo.id}>
            <Card
              hoverable
              cover={
                <Image
                  alt={photo.caption || 'Activity photo'}
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
                  View
                </Button>,
                <Popconfirm
                  title="Are you sure you want to delete this photo?"
                  onConfirm={() => handleDelete(photo.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={
                  <Text strong style={{ fontSize: '12px' }}>
                    {photo.caption || 'No description'}
                  </Text>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      Uploaded by: {photo.uploadedByUser?.firstName} {photo.uploadedByUser?.lastName}
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

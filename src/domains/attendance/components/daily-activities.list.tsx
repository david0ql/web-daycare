import React from 'react';
import { List, Card, Tag, Typography, Space, Button, Popconfirm, message, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDailyActivities } from '../hooks/use-daily-activities.hook';
import { DailyActivity, ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_ICONS } from '../types/daily-activities.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface DailyActivitiesListProps {
  attendanceId: number;
  onEdit?: (activity: DailyActivity) => void;
}

export const DailyActivitiesList: React.FC<DailyActivitiesListProps> = ({
  attendanceId,
  onEdit,
}) => {
  const { activities, isLoading, deleteActivity } = useDailyActivities(attendanceId);

  const handleDelete = async (id: number) => {
    try {
      await deleteActivity(id);
      message.success('Actividad eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting activity:', error);
      message.error('Error al eliminar la actividad');
    }
  };

  const getActivityStatus = (activity: DailyActivity) => {
    if (activity.completed) {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Completada
        </Tag>
      );
    }
    return (
      <Tag color="orange" icon={<ClockCircleOutlined />}>
        Pendiente
      </Tag>
    );
  };

  const getTimeCompleted = (activity: DailyActivity) => {
    if (activity.completed && activity.timeCompleted) {
      return dayjs(activity.timeCompleted).format('HH:mm');
    }
    return null;
  };

  if (isLoading) {
    return <Card loading />;
  }

  if (activities.length === 0) {
    return (
      <Card>
        <Empty 
          description="No hay actividades registradas para este día"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={5} style={{ marginBottom: '16px' }}>
        Actividades Diarias ({activities.length})
      </Title>
      
      <List
        dataSource={activities}
        renderItem={(activity) => (
          <List.Item
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit?.(activity)}
                size="small"
              >
                Editar
              </Button>,
              <Popconfirm
                title="¿Estás seguro de eliminar esta actividad?"
                onConfirm={() => handleDelete(activity.id)}
                okText="Sí"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                >
                  Eliminar
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <div style={{ fontSize: '24px' }}>
                  {ACTIVITY_TYPE_ICONS[activity.activityType]}
                </div>
              }
              title={
                <Space>
                  <Text strong>{ACTIVITY_TYPE_LABELS[activity.activityType]}</Text>
                  {getActivityStatus(activity)}
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  {activity.completed && activity.timeCompleted && (
                    <Text type="secondary">
                      Completada a las: {getTimeCompleted(activity)}
                    </Text>
                  )}
                  {activity.notes && (
                    <Text>{activity.notes}</Text>
                  )}
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Registrado por: {activity.createdByUser?.firstName} {activity.createdByUser?.lastName}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

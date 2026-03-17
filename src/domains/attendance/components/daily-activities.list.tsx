import React from 'react';
import { List, Card, Tag, Typography, Space, Button, Popconfirm, message, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useGetIdentity } from '@refinedev/core';
import { useAuth } from '../../../shared/hooks/use-auth.hook';
import { useDailyActivities } from '../hooks/use-daily-activities.hook';
import { DailyActivity, ACTIVITY_TYPE_LABELS_BY_LANGUAGE, ACTIVITY_TYPE_ICONS } from '../types/daily-activities.types';
import dayjs from 'dayjs';
import { useLanguage } from '../../../shared/contexts/language.context';
import { FLORIDA_TIMEZONE } from '../../../shared/i18n/locale';

const { Title, Text } = Typography;

interface DailyActivitiesListProps {
  attendanceId: number;
  onEdit?: (activity: DailyActivity) => void;
}

const DAILY_ACTIVITIES_LIST_TRANSLATIONS = {
  english: {
    deletedSuccess: "Activity deleted successfully",
    deleteError: "Error deleting activity",
    completed: "Completed",
    pending: "Pending",
    rejected: "Rejected",
    empty: "No activities registered for this day",
    title: "Daily Activities",
    edit: "Edit",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this activity?",
    yes: "Yes",
    no: "No",
    completedAt: "Completed at",
    registeredBy: "Registered by",
  },
  spanish: {
    deletedSuccess: "Actividad eliminada correctamente",
    deleteError: "Error al eliminar actividad",
    completed: "Completada",
    pending: "Pendiente",
    rejected: "Rechazada",
    empty: "No hay actividades registradas para este día",
    title: "Actividades diarias",
    edit: "Editar",
    delete: "Eliminar",
    deleteConfirm: "¿Está seguro de eliminar esta actividad?",
    yes: "Sí",
    no: "No",
    completedAt: "Completada a las",
    registeredBy: "Registrado por",
  },
} as const;

export const DailyActivitiesList: React.FC<DailyActivitiesListProps> = ({
  attendanceId,
  onEdit,
}) => {
  const { language } = useLanguage();
  const t = DAILY_ACTIVITIES_LIST_TRANSLATIONS[language];
  const { data: currentUser } = useGetIdentity<{ id: number }>();
  const { isAdmin } = useAuth();
  const { activities: rawActivities, isLoading, deleteActivity } = useDailyActivities(attendanceId);
  const activities = [...rawActivities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteActivity(id);
      message.success(t.deletedSuccess);
    } catch (error) {
      console.error('Error deleting activity:', error);
      message.error(t.deleteError);
    }
  };

  const getActivityStatus = (activity: DailyActivity) => {
    const status = Number(activity.completed);
    if (status === 1) {
      return <Tag color="green" icon={<CheckCircleOutlined />}>{t.completed}</Tag>;
    }
    if (status === 2) {
      return <Tag color="red" icon={<CloseCircleOutlined />}>{t.rejected}</Tag>;
    }
    return <Tag color="orange" icon={<ClockCircleOutlined />}>{t.pending}</Tag>;
  };

  const getTimeCompleted = (activity: DailyActivity) => {
    if (Number(activity.completed) === 1 && activity.timeCompleted) {
      const dateFormat = language === 'spanish' ? 'YYYY-MM-DD' : 'MM-DD-YYYY';
      return dayjs(activity.timeCompleted).tz(FLORIDA_TIMEZONE).format(`${dateFormat} h:mm A`);
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
          description={t.empty}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={5} style={{ marginBottom: '16px' }}>
        {t.title} ({activities.length})
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
                {t.edit}
              </Button>,
              ...(isAdmin() || currentUser?.id === activity.createdBy ? [
                <Popconfirm
                  title={t.deleteConfirm}
                  onConfirm={() => handleDelete(activity.id)}
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
                </Popconfirm>
              ] : []),
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
                  <Text strong>{ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][activity.activityType]}</Text>
                  {getActivityStatus(activity)}
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  {Number(activity.completed) === 1 && activity.timeCompleted && (
                    <Text type="secondary">
                      {t.completedAt}: {getTimeCompleted(activity)}
                    </Text>
                  )}
                  {activity.notes && (
                    <Text>{activity.notes}</Text>
                  )}
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {t.registeredBy}: {activity.createdByUser?.firstName} {activity.createdByUser?.lastName}
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

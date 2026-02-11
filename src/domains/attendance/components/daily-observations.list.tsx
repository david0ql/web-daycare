import React from 'react';
import { List, Card, Tag, Typography, Space, Button, Popconfirm, message, Empty } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDailyObservations } from '../hooks/use-daily-observations.hook';
import { DailyObservation, MOOD_LABELS_BY_LANGUAGE, MOOD_ICONS, MOOD_COLORS } from '../types/daily-observations.types';
import dayjs from 'dayjs';
import { useLanguage } from '../../../shared/contexts/language.context';

const { Title, Text } = Typography;

interface DailyObservationsListProps {
  attendanceId: number;
  onEdit?: (observation: DailyObservation) => void;
}

const DAILY_OBSERVATIONS_LIST_TRANSLATIONS = {
  english: {
    deletedSuccess: "Observation deleted successfully",
    deleteError: "Error deleting observation",
    empty: "No observations registered for this day",
    title: "Daily Observations",
    edit: "Edit",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this observation?",
    yes: "Yes",
    no: "No",
    observation: "Observation",
    registeredBy: "Registered by",
  },
  spanish: {
    deletedSuccess: "Observación eliminada correctamente",
    deleteError: "Error al eliminar observación",
    empty: "No hay observaciones registradas para este día",
    title: "Observaciones diarias",
    edit: "Editar",
    delete: "Eliminar",
    deleteConfirm: "¿Está seguro de eliminar esta observación?",
    yes: "Sí",
    no: "No",
    observation: "Observación",
    registeredBy: "Registrado por",
  },
} as const;

export const DailyObservationsList: React.FC<DailyObservationsListProps> = ({
  attendanceId,
  onEdit,
}) => {
  const { language } = useLanguage();
  const t = DAILY_OBSERVATIONS_LIST_TRANSLATIONS[language];
  const { observations, isLoading, deleteObservation } = useDailyObservations(attendanceId);

  const handleDelete = async (id: number) => {
    try {
      await deleteObservation(id);
      message.success(t.deletedSuccess);
    } catch (error) {
      console.error('Error deleting observation:', error);
      message.error(t.deleteError);
    }
  };

  const getMoodTag = (mood: string) => {
    return (
      <Tag 
        color={MOOD_COLORS[mood as keyof typeof MOOD_COLORS]}
        icon={<span style={{ fontSize: '14px' }}>{MOOD_ICONS[mood as keyof typeof MOOD_ICONS]}</span>}
      >
        {MOOD_LABELS_BY_LANGUAGE[language][mood as keyof typeof MOOD_LABELS_BY_LANGUAGE.english]}
      </Tag>
    );
  };

  if (isLoading) {
    return <Card loading />;
  }

  if (observations.length === 0) {
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
        {t.title} ({observations.length})
      </Title>
      
      <List
        dataSource={observations}
        renderItem={(observation) => (
          <List.Item
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit?.(observation)}
                size="small"
              >
                {t.edit}
              </Button>,
              <Popconfirm
                title={t.deleteConfirm}
                onConfirm={() => handleDelete(observation.id)}
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
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{t.observation}</Text>
                  {getMoodTag(observation.mood)}
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  <Text>{observation.generalObservations}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {t.registeredBy}: {observation.createdByUser?.firstName} {observation.createdByUser?.lastName} • 
                    {dayjs(observation.createdAt).format('DD/MM/YYYY HH:mm')}
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

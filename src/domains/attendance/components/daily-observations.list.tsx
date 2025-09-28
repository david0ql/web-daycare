import React from 'react';
import { List, Card, Tag, Typography, Space, Button, Popconfirm, message, Empty } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDailyObservations } from '../hooks/use-daily-observations.hook';
import { DailyObservation, MOOD_LABELS, MOOD_ICONS, MOOD_COLORS } from '../types/daily-observations.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface DailyObservationsListProps {
  attendanceId: number;
  onEdit?: (observation: DailyObservation) => void;
}

export const DailyObservationsList: React.FC<DailyObservationsListProps> = ({
  attendanceId,
  onEdit,
}) => {
  const { observations, isLoading, deleteObservation } = useDailyObservations(attendanceId);

  const handleDelete = async (id: number) => {
    try {
      await deleteObservation(id);
      message.success('Observación eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting observation:', error);
      message.error('Error al eliminar la observación');
    }
  };

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

  if (isLoading) {
    return <Card loading />;
  }

  if (observations.length === 0) {
    return (
      <Card>
        <Empty 
          description="No hay observaciones registradas para este día"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={5} style={{ marginBottom: '16px' }}>
        Observaciones Diarias ({observations.length})
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
                Editar
              </Button>,
              <Popconfirm
                title="¿Estás seguro de eliminar esta observación?"
                onConfirm={() => handleDelete(observation.id)}
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
              title={
                <Space>
                  <Text strong>Observación</Text>
                  {getMoodTag(observation.mood)}
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  <Text>{observation.generalObservations}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Registrado por: {observation.createdByUser?.firstName} {observation.createdByUser?.lastName} • 
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

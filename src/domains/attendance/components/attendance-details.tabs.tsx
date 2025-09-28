import React, { useState } from 'react';
import { Tabs, Card, Typography, Space, Button, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DailyActivitiesCreateForm } from './daily-activities.create.form';
import { DailyActivitiesList } from './daily-activities.list';
import { DailyObservationsCreateForm } from './daily-observations.create.form';
import { DailyObservationsList } from './daily-observations.list';
import { ActivityPhotosCreateForm } from './activity-photos.create.form';
import { ActivityPhotosList } from './activity-photos.list';

const { Title } = Typography;

interface AttendanceDetailsTabsProps {
  childId: number;
  attendanceId: number;
}

export const AttendanceDetailsTabs: React.FC<AttendanceDetailsTabsProps> = ({
  childId,
  attendanceId,
}) => {
  const [activeTab, setActiveTab] = useState('activities');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createModalType, setCreateModalType] = useState<'activity' | 'observation' | 'photo'>('activity');

  const handleCreateClick = (type: 'activity' | 'observation' | 'photo') => {
    setCreateModalType(type);
    setIsCreateModalVisible(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalVisible(false);
    // The lists will automatically refresh due to the hooks
  };

  const renderCreateModal = () => {
    const modalTitle = {
      activity: 'Registrar Actividad',
      observation: 'Registrar Observación',
      photo: 'Subir Foto',
    };

    return (
      <Modal
        title={modalTitle[createModalType]}
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        {createModalType === 'activity' && (
          <DailyActivitiesCreateForm
            childId={childId}
            attendanceId={attendanceId}
            onSuccess={handleCreateSuccess}
          />
        )}
        {createModalType === 'observation' && (
          <DailyObservationsCreateForm
            childId={childId}
            attendanceId={attendanceId}
            onSuccess={handleCreateSuccess}
          />
        )}
        {createModalType === 'photo' && (
          <ActivityPhotosCreateForm
            childId={childId}
            attendanceId={attendanceId}
            onSuccess={handleCreateSuccess}
          />
        )}
      </Modal>
    );
  };

  const tabItems = [
    {
      key: 'activities',
      label: 'Actividades',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>Actividades Diarias</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateClick('activity')}
            >
              Registrar Actividad
            </Button>
          </div>
          <DailyActivitiesList
            attendanceId={attendanceId}
          />
        </Space>
      ),
    },
    {
      key: 'observations',
      label: 'Observaciones',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>Observaciones Diarias</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateClick('observation')}
            >
              Registrar Observación
            </Button>
          </div>
          <DailyObservationsList
            attendanceId={attendanceId}
          />
        </Space>
      ),
    },
    {
      key: 'photos',
      label: 'Fotos',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>Fotos de Actividades</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateClick('photo')}
            >
              Subir Foto
            </Button>
          </div>
          <ActivityPhotosList
            attendanceId={attendanceId}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
      {renderCreateModal()}
    </Card>
  );
};

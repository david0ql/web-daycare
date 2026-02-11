import React, { useState } from 'react';
import { Tabs, Card, Typography, Space, Button, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DailyActivitiesCreateForm } from './daily-activities.create.form';
import { DailyActivitiesList } from './daily-activities.list';
import { DailyObservationsCreateForm } from './daily-observations.create.form';
import { DailyObservationsList } from './daily-observations.list';
import { ActivityPhotosCreateForm } from './activity-photos.create.form';
import { ActivityPhotosList } from './activity-photos.list';
import { useLanguage } from '../../../shared/contexts/language.context';

const { Title } = Typography;

interface AttendanceDetailsTabsProps {
  childId: number;
  attendanceId: number;
}

const ATTENDANCE_DETAILS_TRANSLATIONS = {
  english: {
    activities: "Activities",
    observations: "Observations",
    photos: "Photos",
    dailyActivities: "Daily Activities",
    dailyObservations: "Daily Observations",
    activityPhotos: "Activity Photos",
    registerActivity: "Register Activity",
    registerObservation: "Register Observation",
    uploadPhoto: "Upload Photo",
    modalRegisterActivity: "Register Activity",
    modalRegisterObservation: "Register Observation",
    modalUploadPhoto: "Upload Photo",
  },
  spanish: {
    activities: "Actividades",
    observations: "Observaciones",
    photos: "Fotos",
    dailyActivities: "Actividades diarias",
    dailyObservations: "Observaciones diarias",
    activityPhotos: "Fotos de actividades",
    registerActivity: "Registrar actividad",
    registerObservation: "Registrar observación",
    uploadPhoto: "Subir foto",
    modalRegisterActivity: "Registrar actividad",
    modalRegisterObservation: "Registrar observación",
    modalUploadPhoto: "Subir foto",
  },
} as const;

export const AttendanceDetailsTabs: React.FC<AttendanceDetailsTabsProps> = ({
  childId,
  attendanceId,
}) => {
  const { language } = useLanguage();
  const t = ATTENDANCE_DETAILS_TRANSLATIONS[language];
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
      activity: t.modalRegisterActivity,
      observation: t.modalRegisterObservation,
      photo: t.modalUploadPhoto,
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
      label: t.activities,
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>{t.dailyActivities}</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateClick('activity')}
            >
              {t.registerActivity}
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
      label: t.observations,
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>{t.dailyObservations}</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateClick('observation')}
            >
              {t.registerObservation}
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
      label: t.photos,
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>{t.activityPhotos}</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateClick('photo')}
            >
              {t.uploadPhoto}
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

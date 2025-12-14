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
      activity: 'Register Activity',
      observation: 'Register Observation',
      photo: 'Upload Photo',
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
      label: 'Activities',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>Daily Activities</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateClick('activity')}
            >
              Register Activity
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
      label: 'Observations',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>Daily Observations</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateClick('observation')}
            >
              Register Observation
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
      label: 'Photos',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>Activity Photos</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateClick('photo')}
            >
              Upload Photo
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

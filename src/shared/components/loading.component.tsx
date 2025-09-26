import React from 'react';
import { Spin, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingComponentProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullScreen?: boolean;
  height?: string | number;
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  size = 'default',
  tip = 'Cargando...',
  fullScreen = false,
  height = 200,
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
      >
        <Spin size={size} indicator={antIcon} tip={tip} />
      </div>
    );
  }

  return (
    <Card
      style={{
        height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      <Spin size={size} indicator={antIcon} tip={tip} />
    </Card>
  );
};

import React from 'react';
import { Result, Button } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';

interface ErrorComponentProps {
  title?: string;
  message?: string;
  status?: 'error' | 'warning' | 'info' | 'success' | '404' | '403' | '500';
  onRetry?: () => void;
  showRetry?: boolean;
  retryText?: string;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  status = 'error',
  onRetry,
  showRetry = true,
  retryText = 'Retry',
}) => {
  const getIcon = () => {
    switch (status) {
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'info':
        return <ExclamationCircleOutlined style={{ color: '#1890ff' }} />;
      case 'success':
        return <ExclamationCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
    }
  };

  return (
    <Result
      icon={getIcon()}
      title={title}
      subTitle={message}
      extra={
        showRetry && onRetry ? (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onRetry}
          >
            {retryText}
          </Button>
        ) : null
      }
    />
  );
};

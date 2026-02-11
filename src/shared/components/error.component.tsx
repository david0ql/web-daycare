import React from 'react';
import { Result, Button } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/language.context';

interface ErrorComponentProps {
  title?: string;
  message?: string;
  status?: 'error' | 'warning' | 'info' | 'success' | '404' | '403' | '500';
  onRetry?: () => void;
  showRetry?: boolean;
  retryText?: string;
}

const ERROR_COMPONENT_TRANSLATIONS = {
  english: {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
    retry: "Retry",
  },
  spanish: {
    title: "Algo salió mal",
    message: "Ocurrió un error inesperado. Por favor intenta de nuevo.",
    retry: "Reintentar",
  },
} as const;

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  title,
  message,
  status = 'error',
  onRetry,
  showRetry = true,
  retryText,
}) => {
  const { language } = useLanguage();
  const t = ERROR_COMPONENT_TRANSLATIONS[language];

  const resolvedTitle = title ?? t.title;
  const resolvedMessage = message ?? t.message;
  const resolvedRetryText = retryText ?? t.retry;

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
      title={resolvedTitle}
      subTitle={resolvedMessage}
      extra={
        showRetry && onRetry ? (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onRetry}
          >
            {resolvedRetryText}
          </Button>
        ) : null
      }
    />
  );
};

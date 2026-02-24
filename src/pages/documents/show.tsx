import React from 'react';
import { useParams } from 'react-router';
import { Show, EditButton } from '@refinedev/antd';
import { Form, Row, Col, Typography, Button, Space, Tag } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import {
  useDocument,
  formatDocumentDateByLanguage,
  formatExpirationDate,
  getExpirationColor,
  getExpirationLabel,
  formatFileSize,
  getFileIcon,
  getDocumentUrl,
  getDaysUntilExpirationText,
} from '../../domains/documents';
import { useLanguage } from '../../shared/contexts/language.context';

const { Text } = Typography;

const DOCUMENT_SHOW_TRANSLATIONS = {
  english: {
    title: "Document Details",
    loading: "Loading...",
    notFound: "Document not found",
    download: "Download",
    child: "Child",
    documentType: "Document Type",
    expirationOptional: "Expiration Date (Optional)",
    file: "File",
    uploadDate: "Upload Date",
    uploadedBy: "Uploaded by",
    size: "Size",
  },
  spanish: {
    title: "Detalles del documento",
    loading: "Cargando...",
    notFound: "Documento no encontrado",
    download: "Descargar",
    child: "Niño",
    documentType: "Tipo de documento",
    expirationOptional: "Fecha de vencimiento (Opcional)",
    file: "Archivo",
    uploadDate: "Fecha de subida",
    uploadedBy: "Subido por",
    size: "Tamaño",
  },
} as const;

export const DocumentShow: React.FC = () => {
  const { id: idFromUrl } = useParams<{ id: string }>();
  const documentId = idFromUrl != null ? Number(idFromUrl) : undefined;
  const { language } = useLanguage();
  const t = DOCUMENT_SHOW_TRANSLATIONS[language];

  const { data: documentResponse, isLoading } = useDocument(documentId ?? 0);
  const document = documentResponse?.data ?? documentResponse;

  const handleDownload = () => {
    if (document) {
      const documentUrl = getDocumentUrl(document.filename);
      window.open(documentUrl, '_blank');
    }
  };

  if (!documentId) {
    return (
      <Show title={t.title}>
        <div>{t.notFound}</div>
      </Show>
    );
  }

  if (isLoading) {
    return (
      <Show title={t.title} isLoading={true}>
        <div>{t.loading}</div>
      </Show>
    );
  }

  if (!document) {
    return (
      <Show title={t.title}>
        <div>{t.notFound}</div>
      </Show>
    );
  }

  return (
    <Show
      title={t.title}
      headerButtons={
        <>
          <EditButton />
        </>
      }
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t.child}>
              <Text strong>
                {document.child?.firstName} {document.child?.lastName}
              </Text>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t.documentType}>
              <Tag color="blue">{document.documentType?.name}</Tag>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={t.expirationOptional}>
          <Space direction="vertical" size={0}>
            <Text>{formatExpirationDate(document.expiresAt, language)}</Text>
            <Tag color={getExpirationColor(document)}>
              {getExpirationLabel(document, language)}
            </Tag>
            {getDaysUntilExpirationText(document, language) && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {getDaysUntilExpirationText(document, language)}
              </Text>
            )}
          </Space>
        </Form.Item>

        <Form.Item label={t.file}>
          <Space>
            <span>{getFileIcon(document.mimeType)}</span>
            <Text strong>{document.originalFilename}</Text>
            <Text type="secondary">({formatFileSize(document.fileSize)})</Text>
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            >
              {t.download}
            </Button>
          </Space>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t.uploadDate}>
              <Text>{formatDocumentDateByLanguage(document.createdAt, language)}</Text>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t.uploadedBy}>
              <Text>
                {document.uploadedBy2?.firstName} {document.uploadedBy2?.lastName}
              </Text>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Show>
  );
};

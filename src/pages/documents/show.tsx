import React from 'react';
import { useOne } from '@refinedev/core';
import { Show } from '@refinedev/antd';
import { Typography, Space, Tag, Button, Card, Row, Col, Descriptions } from 'antd';
import { DownloadOutlined, FileOutlined } from '@ant-design/icons';
import { 
  formatDocumentDate, 
  formatExpirationDate, 
  getExpirationColor, 
  getExpirationLabel, 
  formatFileSize, 
  getFileIcon,
  getDocumentUrl,
  getDaysUntilExpirationText
} from '../../domains/documents';
import { useLanguage } from '../../shared/contexts/language.context';

const { Title, Text } = Typography;

const DOCUMENT_SHOW_TRANSLATIONS = {
  english: {
    title: "Document Details",
    loading: "Loading...",
    notFound: "Document not found",
    download: "Download",
    documentId: "Document ID",
    fileType: "File Type",
    child: "Child",
    documentType: "Document Type",
    fileSize: "File Size",
    uploadDate: "Upload Date",
    expirationDate: "Expiration Date",
    uploadedBy: "Uploaded by",
    typeDescription: "Document Type Description",
    retentionPolicy: "Retention Policy",
    retentionText: "This document type is retained for",
    days: "days.",
    size: "Size",
  },
  spanish: {
    title: "Detalles del documento",
    loading: "Cargando...",
    notFound: "Documento no encontrado",
    download: "Descargar",
    documentId: "ID del documento",
    fileType: "Tipo de archivo",
    child: "Niño",
    documentType: "Tipo de documento",
    fileSize: "Tamaño del archivo",
    uploadDate: "Fecha de subida",
    expirationDate: "Fecha de vencimiento",
    uploadedBy: "Subido por",
    typeDescription: "Descripción del tipo de documento",
    retentionPolicy: "Política de retención",
    retentionText: "Este tipo de documento se conserva por",
    days: "días.",
    size: "Tamaño",
  },
} as const;

export const DocumentShow: React.FC = () => {
  const { language } = useLanguage();
  const t = DOCUMENT_SHOW_TRANSLATIONS[language];

  const { result: documentData, query: documentQuery } = useOne({
    resource: 'documents',
  }) as any;
  const isLoading = documentQuery.isLoading;

  const document = documentData;

  const handleDownload = () => {
    if (document) {
      const documentUrl = getDocumentUrl(document.filename);
      window.open(documentUrl, '_blank');
    }
  };

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
    <Show title={t.title}>
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>{t.title}</Title>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ margin: 0 }}>
                  {getFileIcon(document.mimeType)} {document.originalFilename}
                </Title>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                >
                  {t.download}
                </Button>
              </div>

              <Descriptions bordered column={2}>
                <Descriptions.Item label={t.documentId}>
                  {document.id}
                </Descriptions.Item>
                <Descriptions.Item label={t.fileType}>
                  <Tag icon={<FileOutlined />}>
                    {document.mimeType}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label={t.child}>
                  <Text strong>
                    {document.child.firstName} {document.child.lastName}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={t.documentType}>
                  <Tag color="blue">
                    {document.documentType.name}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label={t.fileSize}>
                  {formatFileSize(document.fileSize)}
                </Descriptions.Item>
                <Descriptions.Item label={t.uploadDate}>
                  {formatDocumentDate(document.createdAt)}
                </Descriptions.Item>
                
                <Descriptions.Item label={t.expirationDate}>
                  <Space direction="vertical" size={0}>
                    <Text>{formatExpirationDate(document.expiresAt, language)}</Text>
                    <Tag color={getExpirationColor(document)}>
                      {getExpirationLabel(document, language)}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {getDaysUntilExpirationText(document, language)}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t.uploadedBy}>
                  <Text>
                    {document.uploadedBy2.firstName} {document.uploadedBy2.lastName}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {document.documentType.description && (
                <div>
                  <Title level={5}>{t.typeDescription}</Title>
                  <Text>{document.documentType.description}</Text>
                </div>
              )}

              {document.documentType.retentionDays && (
                <div>
                  <Title level={5}>{t.retentionPolicy}</Title>
                  <Text>
                    {t.retentionText} {document.documentType.retentionDays} {t.days}
                  </Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
    </Show>
  );
};

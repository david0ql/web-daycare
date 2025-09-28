import React from 'react';
import { useOne } from '@refinedev/core';
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

const { Title, Text } = Typography;

export const DocumentShow: React.FC = () => {
  const { data, isLoading } = useOne({
    resource: 'documents',
  });

  const document = data?.data;

  const handleDownload = () => {
    if (document) {
      const documentUrl = getDocumentUrl(document.filename);
      window.open(documentUrl, '_blank');
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!document) {
    return <div>Documento no encontrado</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>Detalles del Documento</Title>
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
                  Descargar
                </Button>
              </div>

              <Descriptions bordered column={2}>
                <Descriptions.Item label="ID del Documento">
                  {document.id}
                </Descriptions.Item>
                <Descriptions.Item label="Tipo de Archivo">
                  <Tag icon={<FileOutlined />}>
                    {document.mimeType}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Niño">
                  <Text strong>
                    {document.child.firstName} {document.child.lastName}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tipo de Documento">
                  <Tag color="blue">
                    {document.documentType.name}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Tamaño del Archivo">
                  {formatFileSize(document.fileSize)}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha de Subida">
                  {formatDocumentDate(document.createdAt)}
                </Descriptions.Item>
                
                <Descriptions.Item label="Fecha de Expiración">
                  <Space direction="vertical" size={0}>
                    <Text>{formatExpirationDate(document.expiresAt)}</Text>
                    <Tag color={getExpirationColor(document)}>
                      {getExpirationLabel(document)}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {getDaysUntilExpirationText(document)}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Subido por">
                  <Text>
                    {document.uploadedBy2.firstName} {document.uploadedBy2.lastName}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {document.documentType.description && (
                <div>
                  <Title level={5}>Descripción del Tipo de Documento</Title>
                  <Text>{document.documentType.description}</Text>
                </div>
              )}

              {document.documentType.retentionDays && (
                <div>
                  <Title level={5}>Política de Retención</Title>
                  <Text>
                    Este tipo de documento se conserva por {document.documentType.retentionDays} días.
                  </Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

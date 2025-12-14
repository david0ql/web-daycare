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

const { Title, Text } = Typography;

export const DocumentShow: React.FC = () => {
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
    return <Show title="Document Details" isLoading={true}><div>Loading...</div></Show>;
  }

  if (!document) {
    return <Show title="Document Details"><div>Document not found</div></Show>;
  }

  return (
    <Show title="Document Details">
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>Document Details</Title>
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
                  Download
                </Button>
              </div>

              <Descriptions bordered column={2}>
                <Descriptions.Item label="Document ID">
                  {document.id}
                </Descriptions.Item>
                <Descriptions.Item label="File Type">
                  <Tag icon={<FileOutlined />}>
                    {document.mimeType}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Child">
                  <Text strong>
                    {document.child.firstName} {document.child.lastName}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Document Type">
                  <Tag color="blue">
                    {document.documentType.name}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="File Size">
                  {formatFileSize(document.fileSize)}
                </Descriptions.Item>
                <Descriptions.Item label="Upload Date">
                  {formatDocumentDate(document.createdAt)}
                </Descriptions.Item>
                
                <Descriptions.Item label="Expiration Date">
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
                <Descriptions.Item label="Uploaded by">
                  <Text>
                    {document.uploadedBy2.firstName} {document.uploadedBy2.lastName}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {document.documentType.description && (
                <div>
                  <Title level={5}>Document Type Description</Title>
                  <Text>{document.documentType.description}</Text>
                </div>
              )}

              {document.documentType.retentionDays && (
                <div>
                  <Title level={5}>Retention Policy</Title>
                  <Text>
                    This document type is retained for {document.documentType.retentionDays} days.
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

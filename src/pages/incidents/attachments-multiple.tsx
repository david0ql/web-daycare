import React, { useState } from 'react';
import { Upload, Button, List, Typography, Space, Tag, Image, Modal, message } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { axiosInstance } from '../../shared';
import { useNotification } from '@refinedev/core';

const { Text } = Typography;
const { Dragger } = Upload;

interface Attachment {
  id?: number;
  filename: string;
  filePath: string;
  fileType: 'image' | 'document';
  uploadedBy?: number;
  createdAt?: string;
  file?: File; // For new uploads
}

interface IncidentAttachmentsMultipleProps {
  incidentId?: number;
  initialAttachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

export const IncidentAttachmentsMultiple: React.FC<IncidentAttachmentsMultipleProps> = ({
  incidentId,
  initialAttachments = [],
  onAttachmentsChange,
  disabled = false,
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const { open } = useNotification();

  const handleUpload = async (file: File) => {
    if (!incidentId) {
      open?.({
        type: "error",
        message: "Error uploading file",
        description: "No incident has been selected",
      });
      return false;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('incidentId', incidentId.toString());

      const response = await axiosInstance.post('/incidents/upload-attachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newAttachment: Attachment = {
        id: response.data.id,
        filename: response.data.filename,
        filePath: response.data.filePath,
        fileType: response.data.fileType,
        uploadedBy: response.data.uploadedBy,
        createdAt: response.data.createdAt,
      };

      const updatedAttachments = [...attachments, newAttachment];
      setAttachments(updatedAttachments);
      onAttachmentsChange?.(updatedAttachments);


      open?.({
        type: "success",
        message: "File uploaded successfully",
        description: `The file ${file.name} has been uploaded correctly`,
      });

      return false; // Prevent default upload behavior
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error uploading file",
        description: error.response?.data?.message || error.message,
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    try {
      await axiosInstance.delete(`/incidents/attachments/${attachmentId}`);
      
      const updatedAttachments = attachments.filter(att => att.id !== attachmentId);
      setAttachments(updatedAttachments);
      onAttachmentsChange?.(updatedAttachments);


      open?.({
        type: "success",
        message: "File deleted successfully",
        description: "The file has been deleted correctly",
      });
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error deleting file",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handlePreview = (attachment: Attachment) => {
    if (attachment.fileType === 'image') {
      const token = localStorage.getItem('refine-auth');
      const imageUrl = `https://api.thechildrenworld.com/api/uploads/incident-attachments/${attachment.filename}?token=${token}`;
      setPreviewImage(imageUrl);
      setPreviewVisible(true);
    } else {
      // For documents, you might want to open in a new tab or download
      const token = localStorage.getItem('refine-auth');
      const fileUrl = `https://api.thechildrenworld.com/api/uploads/incident-attachments/${attachment.filename}?token=${token}`;
      window.open(fileUrl, '_blank');
    }
  };

  const getFileIcon = (fileType: string) => {
    return fileType === 'image' ? '🖼️' : '📄';
  };

  const getFileTypeColor = (fileType: string) => {
    return fileType === 'image' ? 'blue' : 'green';
  };

  return (
    <div>
      <Typography.Title level={5}>Incident Attachments</Typography.Title>
      
      {!disabled && (
        <Dragger
          name="file"
          multiple={true}
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={uploading || !incidentId}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag files here to upload
          </p>
          <p className="ant-upload-hint">
            You can upload multiple files (images and documents)
          </p>
        </Dragger>
      )}

      {attachments.length > 0 && (
        <List
          style={{ marginTop: 16 }}
          dataSource={attachments}
          renderItem={(attachment) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(attachment)}
                >
                  View
                </Button>,
                !disabled && (
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => attachment.id && handleDelete(attachment.id)}
                  >
                    Delete
                  </Button>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={<span style={{ fontSize: '20px' }}>{getFileIcon(attachment.fileType)}</span>}
                title={
                  <Space>
                    <Text strong>{attachment.filename}</Text>
                    <Tag color={getFileTypeColor(attachment.fileType)}>
                      {attachment.fileType === 'image' ? 'Image' : 'Document'}
                    </Tag>
                  </Space>
                }
                description={
                  <Text type="secondary">
                    Uploaded on {new Date(attachment.createdAt || '').toLocaleDateString()}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        open={previewVisible}
        title="Image Preview"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <Image
          alt="preview"
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

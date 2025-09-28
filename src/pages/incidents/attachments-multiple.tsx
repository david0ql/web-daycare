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
        message: "Error al subir archivo",
        description: "No se ha seleccionado un incidente",
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
        message: "Archivo subido exitosamente",
        description: `El archivo ${file.name} ha sido subido correctamente`,
      });

      return false; // Prevent default upload behavior
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error al subir archivo",
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
        message: "Archivo eliminado exitosamente",
        description: "El archivo ha sido eliminado correctamente",
      });
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error al eliminar archivo",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handlePreview = (attachment: Attachment) => {
    if (attachment.fileType === 'image') {
      const token = localStorage.getItem('refine-auth');
      const imageUrl = `http://localhost:30000/api/uploads/incident-attachments/${attachment.filename}?token=${token}`;
      setPreviewImage(imageUrl);
      setPreviewVisible(true);
    } else {
      // For documents, you might want to open in a new tab or download
      const token = localStorage.getItem('refine-auth');
      const fileUrl = `http://localhost:30000/api/uploads/incident-attachments/${attachment.filename}?token=${token}`;
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
      <Typography.Title level={5}>Adjuntos del Incidente</Typography.Title>
      
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
            Haz clic o arrastra archivos aquí para subir
          </p>
          <p className="ant-upload-hint">
            Puedes subir múltiples archivos (imágenes y documentos)
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
                  Ver
                </Button>,
                !disabled && (
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => attachment.id && handleDelete(attachment.id)}
                  >
                    Eliminar
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
                      {attachment.fileType === 'image' ? 'Imagen' : 'Documento'}
                    </Tag>
                  </Space>
                }
                description={
                  <Text type="secondary">
                    Subido el {new Date(attachment.createdAt || '').toLocaleDateString()}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        open={previewVisible}
        title="Vista previa de imagen"
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

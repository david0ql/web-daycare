import React, { useState } from 'react';
import { Upload, Button, List, Image, Typography, Space, message, Modal } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useAddIncidentAttachment, useRemoveIncidentAttachment, getAttachmentUrl } from '../../domains/incidents';
import { axiosInstance } from '../../shared';

const { Text } = Typography;

interface IncidentAttachmentsProps {
  incidentId: number;
  attachments: any[];
  onAttachmentsChange: () => void;
}

export const IncidentAttachments: React.FC<IncidentAttachmentsProps> = ({
  incidentId,
  attachments,
  onAttachmentsChange,
}) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const addAttachmentMutation = useAddIncidentAttachment();
  const removeAttachmentMutation = useRemoveIncidentAttachment();

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('incidentId', incidentId.toString());

      // Upload file to get filename and path
      const uploadResponse = await axiosInstance.post('/incidents/upload-attachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { filename, filePath } = uploadResponse.data;

      // Add attachment record
      await addAttachmentMutation.mutateAsync({
        incidentId,
        filename,
        filePath,
        fileType: file.type.startsWith('image/') ? 'image' : 'document',
      });

      message.success('Archivo subido exitosamente');
      onAttachmentsChange();
      setFileList([]);
    } catch (error: any) {
      message.error('Error al subir archivo: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: number) => {
    try {
      await removeAttachmentMutation.mutateAsync(attachmentId);
      message.success('Archivo eliminado exitosamente');
      onAttachmentsChange();
    } catch (error: any) {
      message.error('Error al eliminar archivo');
    }
  };

  const handlePreview = (filePath: string) => {
    setPreviewImage(getAttachmentUrl(filePath));
    setPreviewVisible(true);
  };

  const beforeUpload = (file: File) => {
    const isValidType = file.type.startsWith('image/') || 
                       file.type === 'application/pdf' || 
                       file.type.includes('document') ||
                       file.type.includes('text');
    
    if (!isValidType) {
      message.error('Solo se permiten archivos de imagen, PDF o documentos');
      return false;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('El archivo debe ser menor a 10MB');
      return false;
    }

    handleUpload(file);
    return false; // Prevent auto upload
  };

  return (
    <div>
      <Upload
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={({ fileList: newFileList }) => setFileList(newFileList)}
        showUploadList={false}
        disabled={isUploading}
      >
        <Button 
          icon={<UploadOutlined />} 
          loading={isUploading}
          disabled={isUploading}
        >
          Subir Archivo
        </Button>
      </Upload>

      {attachments.length > 0 && (
        <List
          style={{ marginTop: 16 }}
          dataSource={attachments}
          renderItem={(attachment) => (
            <List.Item
              actions={[
                <Button
                  key="preview"
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(attachment.filePath)}
                  disabled={attachment.fileType !== 'image'}
                >
                  Ver
                </Button>,
                <Button
                  key="delete"
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  loading={removeAttachmentMutation.isPending}
                >
                  Eliminar
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  attachment.fileType === 'image' ? (
                    <Image
                      width={40}
                      height={40}
                      src={getAttachmentUrl(attachment.filePath)}
                      style={{ borderRadius: 4 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    />
                  ) : (
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}>
                      📄
                    </div>
                  )
                }
                title={attachment.filename}
                description={
                  <Space>
                    <Text type="secondary">
                      {attachment.fileType === 'image' ? 'Imagen' : 'Documento'}
                    </Text>
                    <Text type="secondary">
                      Subido por: {attachment.uploadedBy2?.firstName} {attachment.uploadedBy2?.lastName}
                    </Text>
                    <Text type="secondary">
                      {new Date(attachment.createdAt).toLocaleDateString()}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        open={previewVisible}
        title="Vista previa"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
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

import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, message, Upload } from 'antd';
import { UploadOutlined, CameraOutlined } from '@ant-design/icons';
import { useActivityPhotos } from '../hooks/use-activity-photos.hook';
import { CreateActivityPhotoData } from '../types/activity-photos.types';
import { useLanguage } from '../../../shared/contexts/language.context';

const { Title } = Typography;
const { TextArea } = Input;

interface ActivityPhotosCreateFormProps {
  childId: number;
  attendanceId: number;
  onSuccess?: () => void;
}

const ACTIVITY_PHOTOS_CREATE_TRANSLATIONS = {
  english: {
    title: "Upload Activity Photo",
    selectPhoto: "Select Photo",
    uploadPhoto: "Upload Photo",
    photoDescription: "Photo Description",
    photoDescriptionPlaceholder: "Describe what is seen in the photo or what activity is being performed...",
    uploading: "Uploading...",
    selectPhotoError: "Please select a photo",
    uploadSuccess: "Photo uploaded successfully",
    uploadError: "Error uploading photo",
    onlyImages: "Only image files are allowed",
    imageTooLarge: "The image must be less than 5MB",
  },
  spanish: {
    title: "Subir foto de actividad",
    selectPhoto: "Seleccionar foto",
    uploadPhoto: "Subir foto",
    photoDescription: "Descripción de la foto",
    photoDescriptionPlaceholder: "Describe lo que se ve en la foto o qué actividad se está realizando...",
    uploading: "Subiendo...",
    selectPhotoError: "Por favor selecciona una foto",
    uploadSuccess: "Foto subida correctamente",
    uploadError: "Error al subir foto",
    onlyImages: "Solo se permiten archivos de imagen",
    imageTooLarge: "La imagen debe ser menor de 5MB",
  },
} as const;

export const ActivityPhotosCreateForm: React.FC<ActivityPhotosCreateFormProps> = ({
  childId,
  attendanceId,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const t = ACTIVITY_PHOTOS_CREATE_TRANSLATIONS[language];
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  
  const { createPhoto } = useActivityPhotos();

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error(t.selectPhotoError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const photoData: CreateActivityPhotoData = {
        childId,
        attendanceId,
        caption: values.caption,
      };

      await createPhoto(photoData, fileList[0].originFileObj);
      
      message.success(t.uploadSuccess);
      form.resetFields();
      setFileList([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      message.error(t.uploadError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(t.onlyImages);
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error(t.imageTooLarge);
      return false;
    }

    return false; // Prevent auto upload
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: '16px' }}>
        {t.title}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t.selectPhoto}
              required
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={beforeUpload}
                maxCount={1}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <CameraOutlined style={{ fontSize: '24px', color: '#999' }} />
                    <div style={{ marginTop: 8 }}>{t.uploadPhoto}</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t.photoDescription}
              name="caption"
            >
              <TextArea 
                rows={3}
                placeholder={t.photoDescriptionPlaceholder}
                maxLength={300}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
            icon={<UploadOutlined />}
          >
            {isSubmitting ? t.uploading : t.uploadPhoto}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

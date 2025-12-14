import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, message, Upload } from 'antd';
import { UploadOutlined, CameraOutlined } from '@ant-design/icons';
import { useActivityPhotos } from '../hooks/use-activity-photos.hook';
import { CreateActivityPhotoData } from '../types/activity-photos.types';

const { Title } = Typography;
const { TextArea } = Input;

interface ActivityPhotosCreateFormProps {
  childId: number;
  attendanceId: number;
  onSuccess?: () => void;
}

export const ActivityPhotosCreateForm: React.FC<ActivityPhotosCreateFormProps> = ({
  childId,
  attendanceId,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  
  const { createPhoto } = useActivityPhotos();

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error('Please select a photo');
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
      
      message.success('Photo uploaded successfully');
      form.resetFields();
      setFileList([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      message.error('Error uploading photo');
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
      message.error('Only image files are allowed');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('The image must be less than 5MB');
      return false;
    }

    return false; // Prevent auto upload
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: '16px' }}>
        Upload Activity Photo
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Select Photo"
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
                    <div style={{ marginTop: 8 }}>Upload Photo</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Photo Description"
              name="caption"
            >
              <TextArea 
                rows={3}
                placeholder="Describe what is seen in the photo or what activity is being performed..."
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
            {isSubmitting ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

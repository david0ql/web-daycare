import React, { useState, useEffect } from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useInvalidate, useGo, useNotification } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Row, Col, Typography, Upload, message } from "antd";
import { useParams } from "react-router";
import { CameraOutlined } from "@ant-design/icons";
import { axiosInstance } from "../../../shared";

const { Title } = Typography;
const { TextArea } = Input;

export const AttendancePhotosEdit: React.FC = () => {
  const { id } = useParams();
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { formProps, saveButtonProps } = useForm({
    resource: "attendance/activity-photos",
    onMutationSuccess: async (data, variables) => {
      // Force invalidate and refetch all activity-photos-related queries
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "attendance/activity-photos");
        },
      });
      
      // Force refetch all activity-photos queries
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "attendance/activity-photos");
        },
      });
      
      // Show success notification
      open?.({
        type: "success",
        message: "Foto actualizada exitosamente",
        description: "Los cambios se han guardado correctamente",
      });
      
      // Navigate back to photos list with a small delay for better UX
      setTimeout(() => {
        go({
          to: "/attendance/photos",
          type: "push",
        });
      }, 1000);
    },
    onMutationError: (error, variables) => {
      if (error?.response?.data?.message) {
        const errorMessages = Array.isArray(error.response.data.message) 
          ? error.response.data.message 
          : [error.response.data.message];
        
        errorMessages.forEach((msg: any, index: number) => {
          console.log(`🔍 Error ${index + 1}:`, msg);
        });
      }
      open?.({ 
        type: "error", 
        message: "Error al actualizar la foto", 
        description: "No se pudo actualizar la foto. Verifica los datos e intenta nuevamente." 
      });
    }
  });

  // Load current image when form data is available
  useEffect(() => {
    if (formProps.initialValues?.filename) {
      const token = localStorage.getItem('refine-auth');
      const imageUrl = `https://api.thechildrenworld.com/api/uploads/activity-photos/${formProps.initialValues.filename}?token=${token}`;
      
      // Set initial fileList with current image
      setFileList([
        {
          uid: '-1',
          name: formProps.initialValues.filename,
          status: 'done',
          url: imageUrl,
        }
      ]);
    }
  }, [formProps.initialValues]);

  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo se permiten archivos de imagen');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('La imagen debe ser menor a 5MB');
      return false;
    }

    return false; // Prevent auto upload
  };

  const handleFinish = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      // Check if a new file was selected (has originFileObj)
      const newFile = fileList.find(file => file.originFileObj);
      
      if (newFile?.originFileObj) {
        // If a new file is selected, upload it with FormData
        const formData = new FormData();
        formData.append('file', newFile.originFileObj);
        if (values.caption !== undefined) {
          formData.append('caption', values.caption || '');
        }

        await axiosInstance.patch(`/attendance/activity-photos/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else if (fileList.length === 0) {
        // If fileList is empty (image was removed), we need to handle this
        // For now, we'll just update the caption if provided
        const updateData: any = {};
        if (values.caption !== undefined) {
          updateData.caption = values.caption;
        }

        if (Object.keys(updateData).length > 0) {
          await axiosInstance.patch(`/attendance/activity-photos/${id}`, updateData);
        } else {
          message.warning('Debe seleccionar una nueva foto o mantener la actual');
          setIsSubmitting(false);
          return;
        }
      } else {
        // If no new file but fileList has items (current image), just update the caption
        const updateData: any = {};
        if (values.caption !== undefined) {
          updateData.caption = values.caption;
        }

        if (Object.keys(updateData).length > 0) {
          await axiosInstance.patch(`/attendance/activity-photos/${id}`, updateData);
        }
      }

      message.success('Foto actualizada exitosamente');
      
      // Invalidate cache
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "attendance/activity-photos");
        },
      });
      
      // Navigate back to photos list
      setTimeout(() => {
        go({
          to: "/attendance/photos",
          type: "push",
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('Error updating photo:', error);
      message.error('Error al actualizar la foto: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Edit
      title="Editar Foto de Actividad"
      saveButtonProps={{
        ...saveButtonProps,
        loading: isSubmitting,
        onClick: () => form.submit(),
      }}
    >
      <Form {...formProps} form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Foto Actual"
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
                    <div style={{ marginTop: 8 }}>Cambiar Foto</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Descripción"
              name="caption"
            >
              <TextArea 
                rows={3}
                placeholder="Descripción de la foto (opcional)"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
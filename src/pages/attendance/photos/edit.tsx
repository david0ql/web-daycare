import React, { useState, useEffect } from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useGo, useNotification } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Row, Col, Upload, message } from "antd";
import { useParams } from "react-router";
import { CameraOutlined } from "@ant-design/icons";
import { axiosInstance } from "../../../shared";
import { useLanguage } from "../../../shared/contexts/language.context";

const { TextArea } = Input;

const ATTENDANCE_PHOTOS_EDIT_TRANSLATIONS = {
  english: {
    title: "Edit Activity Photo",
    save: "Save",
    updatedSuccess: "Photo updated successfully",
    updatedDescription: "Changes have been saved correctly",
    updateError: "Error updating photo",
    updateErrorDescription: "Could not update photo. Please verify the data and try again.",
    onlyImagesAllowed: "Only image files are allowed",
    imageTooLarge: "Image must be less than 5MB",
    mustSelectOrKeep: "You must select a new photo or keep the current one",
    currentPhoto: "Current Photo",
    changePhoto: "Change Photo",
    description: "Description",
    descriptionPlaceholder: "Photo description (optional)",
    updateErrorPrefix: "Error updating photo",
  },
  spanish: {
    title: "Editar foto de actividad",
    save: "Guardar",
    updatedSuccess: "Foto actualizada correctamente",
    updatedDescription: "Los cambios se han guardado correctamente",
    updateError: "Error actualizando la foto",
    updateErrorDescription: "No se pudo actualizar la foto. Verifica los datos e inténtalo de nuevo.",
    onlyImagesAllowed: "Solo se permiten archivos de imagen",
    imageTooLarge: "La imagen debe ser menor a 5MB",
    mustSelectOrKeep: "Debes seleccionar una nueva foto o mantener la actual",
    currentPhoto: "Foto actual",
    changePhoto: "Cambiar foto",
    description: "Descripción",
    descriptionPlaceholder: "Descripción de la foto (opcional)",
    updateErrorPrefix: "Error actualizando la foto",
  },
} as const;

export const AttendancePhotosEdit: React.FC = () => {
  const { id } = useParams();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const { language } = useLanguage();
  const t = ATTENDANCE_PHOTOS_EDIT_TRANSLATIONS[language];
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
        message: t.updatedSuccess,
        description: t.updatedDescription,
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
      open?.({ 
        type: "error", 
        message: t.updateError, 
        description: t.updateErrorDescription,
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
      message.error(t.onlyImagesAllowed);
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error(t.imageTooLarge);
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
          message.warning(t.mustSelectOrKeep);
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

	      message.success(t.updatedSuccess);
      
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
	      message.error(`${t.updateErrorPrefix}: ${error.response?.data?.message || error.message}`);
	    } finally {
	      setIsSubmitting(false);
	    }
	  };

	  return (
	    <Edit
	      title={t.title}
	      saveButtonProps={{
	        ...saveButtonProps,
	        loading: isSubmitting,
	        children: t.save,
	        onClick: () => form.submit(),
	      }}
	    >
      <Form {...formProps} form={form} layout="vertical" onFinish={handleFinish}>
	        <Row gutter={16}>
	          <Col span={24}>
	            <Form.Item
	              label={t.currentPhoto}
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
	                    <div style={{ marginTop: 8 }}>{t.changePhoto}</div>
	                  </div>
	                )}
	              </Upload>
	            </Form.Item>
	          </Col>
	        </Row>

        <Row gutter={16}>
	          <Col span={24}>
	            <Form.Item
	              label={t.description}
	              name="caption"
	            >
	              <TextArea 
	                rows={3}
	                placeholder={t.descriptionPlaceholder}
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

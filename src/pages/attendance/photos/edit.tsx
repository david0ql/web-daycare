import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useInvalidate, useGo, useNotification } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Row, Col, Typography } from "antd";
import { useParams } from "react-router";

const { Title } = Typography;
const { TextArea } = Input;

export const AttendancePhotosEdit: React.FC = () => {
  const { id } = useParams();
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  
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

  const handleFinish = (values: any) => {
    formProps.onFinish?.(values);
  };

  return (
    <Edit
      title="Editar Foto de Actividad"
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
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
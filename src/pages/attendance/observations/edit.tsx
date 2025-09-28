import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useInvalidate, useGo, useNotification } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select, Row, Col, Typography } from "antd";
import { useParams } from "react-router";
import { MOOD_LABELS } from "../../../domains/attendance/types/daily-observations.types";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const AttendanceObservationsEdit: React.FC = () => {
  const { id } = useParams();
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  
  const { formProps, saveButtonProps } = useForm({
    resource: "attendance/daily-observations",
    onMutationSuccess: async (data, variables) => {
      // Force invalidate and refetch all daily-observations-related queries
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "attendance/daily-observations");
        },
      });
      
      // Force refetch all daily-observations queries
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "attendance/daily-observations");
        },
      });
      
      // Show success notification
      open?.({
        type: "success",
        message: "Observación actualizada exitosamente",
        description: "Los cambios se han guardado correctamente",
      });
      
      // Navigate back to observations list with a small delay for better UX
      setTimeout(() => {
        go({
          to: "/attendance/observations",
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
        message: "Error al actualizar la observación", 
        description: "No se pudo actualizar la observación. Verifica los datos e intenta nuevamente." 
      });
    }
  });

  const handleFinish = (values: any) => {
    formProps.onFinish?.(values);
  };

  return (
    <Edit
      title="Editar Observación Diaria"
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Estado de Ánimo"
              name="mood"
              rules={[{ required: true, message: 'Por favor seleccione el estado de ánimo' }]}
            >
              <Select placeholder="Seleccione el estado de ánimo">
                {Object.entries(MOOD_LABELS).map(([key, label]) => (
                  <Option key={key} value={key}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Observaciones Generales"
              name="generalObservations"
              rules={[{ required: true, message: 'Por favor ingrese las observaciones' }]}
            >
              <TextArea 
                rows={4}
                placeholder="Describa las observaciones sobre el niño"
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
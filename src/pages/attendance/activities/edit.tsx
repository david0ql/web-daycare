import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useInvalidate, useGo, useNotification } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select, Switch, TimePicker, Row, Col, Typography } from "antd";
import { useParams } from "react-router";
import { ActivityTypeEnum, ACTIVITY_TYPE_LABELS } from "../../../domains/attendance/types/daily-activities.types";
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const AttendanceActivitiesEdit: React.FC = () => {
  const { id } = useParams();
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  
  const { formProps, saveButtonProps } = useForm({
    resource: "attendance/daily-activities",
    onMutationSuccess: async (data, variables) => {
      console.log("🔍 EDIT Activity Mutation success - data:", data);
      console.log("🔍 EDIT Activity Mutation success - variables:", variables);
      
      // Force invalidate and refetch all daily-activities-related queries
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "attendance/daily-activities");
        },
      });
      
      // Force refetch all daily-activities queries
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "attendance/daily-activities");
        },
      });
      
      // Show success notification
      open?.({
        type: "success",
        message: "Actividad actualizada exitosamente",
        description: "Los cambios se han guardado correctamente",
      });
      
      // Navigate back to activities list with a small delay for better UX
      setTimeout(() => {
        go({
          to: "/attendance/activities",
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
        message: "Error al actualizar la actividad", 
        description: "No se pudo actualizar la actividad. Verifica los datos e intenta nuevamente." 
      });
    }
  });

  // Transform data for form - using formProps.initialValues
  React.useEffect(() => {
    if (formProps.initialValues) {
      const activityData = formProps.initialValues;
      
      const formData = {
        ...activityData,
        // Convert completed to boolean for Switch
        completed: Boolean(activityData.completed),
        // Convert timeCompleted to dayjs object for TimePicker
        timeCompleted: activityData.timeCompleted ? dayjs(activityData.timeCompleted) : undefined,
      };
      
      formProps.form?.setFieldsValue(formData);
    }
  }, [formProps.initialValues, formProps.form]);

  const handleFinish = (values: any) => {
    const formData = {
      ...values,
      completed: Boolean(values.completed),
      timeCompleted: values.completed && values.timeCompleted ? dayjs(values.timeCompleted).format('YYYY-MM-DD HH:mm:ss') : null,
    };
    
    formProps.onFinish?.(formData);
  };

  return (
    <Edit
      title="Editar Actividad Diaria"
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tipo de Actividad"
              name="activityType"
              rules={[{ required: true, message: 'Por favor seleccione el tipo de actividad' }]}
            >
              <Select placeholder="Seleccione el tipo de actividad">
                {Object.values(ActivityTypeEnum).map((type) => (
                  <Option key={type} value={type}>
                    {ACTIVITY_TYPE_LABELS[type]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="Completada"
              name="completed"
              valuePropName="checked"
              getValueFromEvent={(checked) => Boolean(checked)}
              getValueProps={(value) => ({ value: Boolean(value) })}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.completed !== currentValues.completed}
        >
          {({ getFieldValue }) => {
            const completed = getFieldValue('completed');
            return completed ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Hora de Completado"
                    name="timeCompleted"
                    rules={[{ required: true, message: 'Por favor seleccione la hora de completado' }]}
                    getValueFromEvent={(time) => time ? dayjs(time) : undefined}
                    getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
                  >
                    <TimePicker 
                      style={{ width: '100%' }}
                      format="HH:mm"
                      placeholder="Seleccione la hora"
                    />
                  </Form.Item>
                </Col>
              </Row>
            ) : null;
          }}
        </Form.Item>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Notas"
              name="notes"
            >
              <TextArea 
                rows={3}
                placeholder="Notas adicionales sobre la actividad (opcional)"
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

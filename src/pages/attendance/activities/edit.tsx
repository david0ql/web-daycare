import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useGo, useNotification } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select, Switch, TimePicker, Row, Col } from "antd";
import { ActivityTypeEnum, ACTIVITY_TYPE_LABELS_BY_LANGUAGE } from "../../../domains/attendance/types/daily-activities.types";
import dayjs from 'dayjs';
import { useLanguage } from "../../../shared/contexts/language.context";

const { TextArea } = Input;
const { Option } = Select;

const ATTENDANCE_ACTIVITIES_EDIT_TRANSLATIONS = {
  english: {
    title: "Edit Daily Activity",
    save: "Save",
    activityType: "Activity Type",
    selectActivityTypeRequired: "Please select activity type",
    selectActivityType: "Select activity type",
    completed: "Completed",
    completionTime: "Completion Time",
    selectCompletionTimeRequired: "Please select completion time",
    selectTime: "Select time",
    notes: "Notes",
    notesPlaceholder: "Additional notes about the activity (optional)",
    updatedSuccess: "Activity updated successfully",
    updatedDescription: "Changes have been saved correctly",
    updateError: "Error updating activity",
    updateErrorDescription: "Could not update activity. Please check the data and try again.",
  },
  spanish: {
    title: "Editar actividad diaria",
    save: "Guardar",
    activityType: "Tipo de actividad",
    selectActivityTypeRequired: "Por favor selecciona el tipo de actividad",
    selectActivityType: "Selecciona tipo de actividad",
    completed: "Completado",
    completionTime: "Hora de finalización",
    selectCompletionTimeRequired: "Por favor selecciona la hora de finalización",
    selectTime: "Selecciona hora",
    notes: "Notas",
    notesPlaceholder: "Notas adicionales sobre la actividad (opcional)",
    updatedSuccess: "Actividad actualizada correctamente",
    updatedDescription: "Los cambios se han guardado correctamente",
    updateError: "Error actualizando la actividad",
    updateErrorDescription: "No se pudo actualizar la actividad. Verifica los datos e inténtalo de nuevo.",
  },
} as const;

export const AttendanceActivitiesEdit: React.FC = () => {
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const { language } = useLanguage();
  const t = ATTENDANCE_ACTIVITIES_EDIT_TRANSLATIONS[language];
  
  const { formProps, saveButtonProps } = useForm({
    resource: "attendance/daily-activities",
    onMutationSuccess: async (data, variables) => {
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
        message: t.updatedSuccess,
        description: t.updatedDescription,
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
      open?.({ 
        type: "error", 
        message: t.updateError, 
        description: t.updateErrorDescription,
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
      title={t.title}
      saveButtonProps={{ ...saveButtonProps, children: t.save }}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.activityType}
              name="activityType"
              rules={[{ required: true, message: t.selectActivityTypeRequired }]}
            >
              <Select placeholder={t.selectActivityType}>
                {Object.values(ActivityTypeEnum).map((type) => (
                  <Option key={type} value={type}>
                    {ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][type]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label={t.completed}
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
	                    label={t.completionTime}
	                    name="timeCompleted"
	                    rules={[{ required: true, message: t.selectCompletionTimeRequired }]}
	                    getValueFromEvent={(time) => time ? dayjs(time) : undefined}
	                    getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
	                  >
	                    <TimePicker 
	                      style={{ width: '100%' }}
	                      format="HH:mm"
	                      placeholder={t.selectTime}
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
	              label={t.notes}
	              name="notes"
	            >
	              <TextArea 
	                rows={3}
	                placeholder={t.notesPlaceholder}
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

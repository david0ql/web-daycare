import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useGo, useNotification } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select, Row, Col } from "antd";
import { MoodEnum, MOOD_LABELS_BY_LANGUAGE } from "../../../domains/attendance/types/daily-observations.types";
import { useLanguage } from "../../../shared/contexts/language.context";

const { TextArea } = Input;
const { Option } = Select;

const ATTENDANCE_OBSERVATIONS_EDIT_TRANSLATIONS = {
  english: {
    title: "Edit Daily Observation",
    save: "Save",
    mood: "Mood",
    selectMoodRequired: "Please select mood",
    selectMood: "Select mood",
    generalObservations: "General Observations",
    generalObservationsRequired: "Please enter observations",
    generalObservationsPlaceholder: "Describe observations about the child",
    updatedSuccess: "Observation updated successfully",
    updatedDescription: "Changes have been saved correctly",
    updateError: "Error updating observation",
    updateErrorDescription: "Could not update observation. Please check the data and try again.",
  },
  spanish: {
    title: "Editar observación diaria",
    save: "Guardar",
    mood: "Ánimo",
    selectMoodRequired: "Por favor selecciona el ánimo",
    selectMood: "Selecciona ánimo",
    generalObservations: "Observaciones generales",
    generalObservationsRequired: "Por favor ingresa las observaciones",
    generalObservationsPlaceholder: "Describe observaciones sobre el niño",
    updatedSuccess: "Observación actualizada correctamente",
    updatedDescription: "Los cambios se han guardado correctamente",
    updateError: "Error actualizando la observación",
    updateErrorDescription: "No se pudo actualizar la observación. Verifica los datos e inténtalo de nuevo.",
  },
} as const;

export const AttendanceObservationsEdit: React.FC = () => {
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const { language } = useLanguage();
  const t = ATTENDANCE_OBSERVATIONS_EDIT_TRANSLATIONS[language];
  
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
        message: t.updatedSuccess,
        description: t.updatedDescription,
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
      open?.({ 
        type: "error", 
        message: t.updateError, 
        description: t.updateErrorDescription,
      });
    }
  });

  const handleFinish = (values: any) => {
    formProps.onFinish?.(values);
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
              label={t.mood}
              name="mood"
              rules={[{ required: true, message: t.selectMoodRequired }]}
            >
              <Select placeholder={t.selectMood}>
                {Object.values(MoodEnum).map((mood) => (
                  <Option key={mood} value={mood}>
                    {MOOD_LABELS_BY_LANGUAGE[language][mood]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t.generalObservations}
              name="generalObservations"
              rules={[{ required: true, message: t.generalObservationsRequired }]}
            >
              <TextArea 
                rows={4}
                placeholder={t.generalObservationsPlaceholder}
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

import React, { useEffect, useState } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, Row, Col, Typography } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGo, useInvalidate, useNotification } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { useUpdateIncident } from '../../domains/incidents';
import { IncidentAttachmentsMultiple } from './attachments-multiple';
import dayjs from 'dayjs';
import { useLanguage } from '../../shared/contexts/language.context';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const INCIDENTS_EDIT_TRANSLATIONS = {
  english: {
    title: "Edit Incident",
    save: "Save",
    updateSuccess: "Incident updated successfully",
    updateSuccessDesc: "Changes have been saved correctly",
    updateError: "Error updating incident",
    unexpectedError: "An unexpected error occurred",
    dateRequired: "Incident date is required",
    dateInvalid: "Incident date is not valid",
    loading: "Loading...",
    notFound: "Incident not found",
    child: "Child",
    selectChild: "Select a child",
    selectChildRequired: "Please select a child",
    incidentType: "Incident Type",
    selectIncidentType: "Select an incident type",
    selectIncidentTypeRequired: "Please select an incident type",
    noTypesAvailable: "No types available",
    incidentTitle: "Incident Title",
    incidentTitleRequired: "Please enter the incident title",
    incidentTitlePlaceholder: "Incident title",
    incidentDescription: "Incident Description",
    incidentDescriptionRequired: "Please enter the incident description",
    incidentDescriptionPlaceholder: "Detailed incident description",
    incidentDateTime: "Incident Date and Time",
    incidentDateTimeRequired: "Please select the incident date and time",
    selectDateTime: "Select date and time",
    location: "Location",
    locationPlaceholder: "Location where the incident occurred",
    actionTaken: "Action Taken",
    actionTakenPlaceholder: "Action taken in response to the incident (optional)",
    noChildrenAvailable: "No children available",
  },
  spanish: {
    title: "Editar incidente",
    save: "Guardar",
    updateSuccess: "Incidente actualizado correctamente",
    updateSuccessDesc: "Los cambios han sido guardados correctamente",
    updateError: "Error al actualizar incidente",
    unexpectedError: "Ocurrió un error inesperado",
    dateRequired: "La fecha del incidente es requerida",
    dateInvalid: "La fecha del incidente no es válida",
    loading: "Cargando...",
    notFound: "Incidente no encontrado",
    child: "Niño",
    selectChild: "Selecciona un niño",
    selectChildRequired: "Por favor selecciona un niño",
    incidentType: "Tipo de incidente",
    selectIncidentType: "Selecciona un tipo de incidente",
    selectIncidentTypeRequired: "Por favor selecciona un tipo de incidente",
    noTypesAvailable: "No hay tipos disponibles",
    incidentTitle: "Título del incidente",
    incidentTitleRequired: "Por favor ingresa el título del incidente",
    incidentTitlePlaceholder: "Título del incidente",
    incidentDescription: "Descripción del incidente",
    incidentDescriptionRequired: "Por favor ingresa la descripción del incidente",
    incidentDescriptionPlaceholder: "Descripción detallada del incidente",
    incidentDateTime: "Fecha y hora del incidente",
    incidentDateTimeRequired: "Por favor selecciona la fecha y hora del incidente",
    selectDateTime: "Selecciona fecha y hora",
    location: "Ubicación",
    locationPlaceholder: "Ubicación donde ocurrió el incidente",
    actionTaken: "Acción tomada",
    actionTakenPlaceholder: "Acción tomada en respuesta al incidente (opcional)",
    noChildrenAvailable: "No hay niños disponibles",
  },
} as const;

export const IncidentsEdit: React.FC = () => {
  const queryClient = useQueryClient();
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const { language } = useLanguage();
  const t = INCIDENTS_EDIT_TRANSLATIONS[language];
  
  const { formProps, saveButtonProps } = useForm({
    resource: 'incidents',
    onMutationSuccess: async (data) => {
      console.log('🔍 onMutationSuccess - data:', data);
      
      // Use Refine's useInvalidate for proper cache invalidation
      await invalidate({
        resource: "incidents",
        invalidates: ["list"],
      });

      // Also invalidate the specific incident data
      await invalidate({
        resource: "incidents",
        invalidates: ["detail"],
        id: (data as any).id,
      });

      // Show success notification
      open?.({
        type: "success",
        message: t.updateSuccess,
        description: t.updateSuccessDesc,
      });

      // Navigate back to incidents list
      setTimeout(() => {
        go({
          to: "/incidents",
          type: "push",
        });
      }, 1000);
    },
    onMutationError: (error) => {
      console.log('🔍 onMutationError - error:', error);
      open?.({
        type: "error",
        message: t.updateError,
        description: error.message || t.unexpectedError,
      });
    },
  });

  const updateIncidentMutation = useUpdateIncident();
  const incidentData = formProps.initialValues;
  const [attachments, setAttachments] = useState<any[]>([]);
  
  // Debug logging
  console.log('🔍 Edit component - formProps:', formProps);
  console.log('🔍 Edit component - incidentData:', incidentData);
  console.log('🔍 Edit component - incidentAttachments:', incidentData?.incidentAttachments);

  // Fetch children for the select
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const response = await axiosInstance.get('/children');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch incident types
  const { data: incidentTypesData, isLoading: incidentTypesLoading } = useQuery({
    queryKey: ['incident-types'],
    queryFn: async () => {
      const response = await axiosInstance.get('/incidents/types');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get attachments from incident data (they come included in the incident response)
  const attachmentsData = incidentData?.incidentAttachments || [];

  useEffect(() => {
    console.log('🔍 useEffect - incidentData:', incidentData);
    console.log('🔍 useEffect - formProps.form:', formProps.form);
    
    if (incidentData) {
      const formValues = {
        childId: incidentData.childId,
        incidentTypeId: incidentData.incidentTypeId,
        title: incidentData.title,
        description: incidentData.description,
        incidentDate: incidentData.incidentDate ? dayjs(incidentData.incidentDate) : undefined,
        location: incidentData.location,
        actionTaken: incidentData.actionTaken,
      };
      
      console.log('🔍 useEffect - setting form values:', formValues);
      formProps.form?.setFieldsValue(formValues);
    }
  }, [incidentData, formProps.form]);

  // Update attachments state when incident data is loaded
  useEffect(() => {
    if (incidentData?.incidentAttachments) {
      console.log('🔍 useEffect - incidentAttachments:', incidentData.incidentAttachments);
      setAttachments(incidentData.incidentAttachments);
    }
  }, [incidentData]);

  const handleFinish = async (values: any) => {
    console.log('🔍 handleFinish - values:', values);
    console.log('🔍 handleFinish - incidentDate:', values.incidentDate);
    console.log('🔍 handleFinish - incidentDate type:', typeof values.incidentDate);
    
    // Validate and format date using dayjs
    let incidentDate: string;
    
    // Check if incidentDate exists and is valid
    if (!values.incidentDate) {
      console.log('🔍 handleFinish - no incidentDate provided');
      open?.({
        type: "error",
        message: t.updateError,
        description: t.dateRequired,
      });
      return;
    }
    
    // Try to parse the date
    const parsedDate = dayjs(values.incidentDate);
    if (!parsedDate.isValid()) {
      console.log('🔍 handleFinish - invalid date format:', values.incidentDate);
      open?.({
        type: "error",
        message: t.updateError,
        description: t.dateInvalid,
      });
      return;
    }
    
    incidentDate = parsedDate.toISOString();
    console.log('🔍 handleFinish - formatted incidentDate:', incidentDate);

    const updateData = {
      ...values,
      incidentDate,
    };

    // Let useForm handle the mutation - it will trigger onMutationSuccess
    formProps.onFinish?.(updateData);
  };

  if (saveButtonProps.disabled) {
    return <div>{t.loading}</div>;
  }

  if (!incidentData) {
    return <div>{t.notFound}</div>;
  }

  return (
    <Edit
      title={t.title}
      saveButtonProps={{ ...saveButtonProps, children: t.save }}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.child}
              name="childId"
              rules={[{ required: true, message: t.selectChildRequired }]}
            >
              <Select
                placeholder={t.selectChild}
                showSearch
                loading={childrenLoading}
                notFoundContent={childrenLoading ? t.loading : t.noChildrenAvailable}
                filterOption={(input, option) =>
                  String(option?.children || "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {(childrenData?.data || []).map((child: any) => (
                  <Option key={child.id} value={child.id}>
                    {child.firstName} {child.lastName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t.incidentType}
              name="incidentTypeId"
              rules={[{ required: true, message: t.selectIncidentTypeRequired }]}
            >
              <Select
                placeholder={t.selectIncidentType}
                loading={incidentTypesLoading}
                notFoundContent={incidentTypesLoading ? t.loading : t.noTypesAvailable}
              >
                {(incidentTypesData || []).map((type: any) => (
                  <Option key={type.id} value={type.id}>
                    <div>
                      <div>{type.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {type.severityLevel} - {type.description}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t.incidentTitle}
              name="title"
              rules={[{ required: true, message: t.incidentTitleRequired }]}
            >
              <Input placeholder={t.incidentTitlePlaceholder} maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t.incidentDescription}
              name="description"
              rules={[{ required: true, message: t.incidentDescriptionRequired }]}
            >
              <TextArea
                rows={4}
                placeholder={t.incidentDescriptionPlaceholder}
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.incidentDateTime}
              name="incidentDate"
              rules={[{ required: true, message: t.incidentDateTimeRequired }]}
              getValueFromEvent={(date) => {
                console.log("🔍 DatePicker getValueFromEvent:", date);
                return date;
              }}
              getValueProps={(value) => {
                console.log("🔍 DatePicker getValueProps:", value, typeof value);
                if (!value) return { value: null };
                if (dayjs.isDayjs(value)) return { value };
                if (typeof value === 'string') {
                  const dayjsValue = dayjs(value);
                  return { value: dayjsValue.isValid() ? dayjsValue : null };
                }
                return { value: null };
              }}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder={t.selectDateTime}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t.location}
              name="location"
            >
              <Input placeholder={t.locationPlaceholder} maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t.actionTaken}
              name="actionTaken"
            >
              <TextArea
                rows={3}
                placeholder={t.actionTakenPlaceholder}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* Attachments Section */}
      {incidentData?.id && (
        <div style={{ marginTop: 24 }}>
          <IncidentAttachmentsMultiple
            incidentId={incidentData.id}
            initialAttachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        </div>
      )}
    </Edit>
  );
};

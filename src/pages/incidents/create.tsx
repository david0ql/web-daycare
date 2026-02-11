import React, { useState } from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, Row, Col, Typography, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useGo, useInvalidate, useNotification } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { useCreateIncident } from '../../domains/incidents';
import { IncidentAttachmentsMultiple } from './attachments-multiple';
import { useLanguage } from '../../shared/contexts/language.context';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const INCIDENTS_CREATE_TRANSLATIONS = {
  english: {
    title: "Report Incident",
    save: "Save",
    successMessage: "Incident created successfully",
    successDesc: "The incident has been registered correctly. You can now add attachments.",
    errorMessage: "Error creating incident",
    dateRequired: "Incident date is required",
    dateInvalid: "Incident date is not valid",
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
    loading: "Loading...",
    noChildrenAvailable: "No children available",
    finishReturn: "Finish and return to list",
  },
  spanish: {
    title: "Reportar incidente",
    save: "Guardar",
    successMessage: "Incidente creado correctamente",
    successDesc: "El incidente ha sido registrado. Ahora puedes agregar adjuntos.",
    errorMessage: "Error al crear el incidente",
    dateRequired: "La fecha del incidente es requerida",
    dateInvalid: "La fecha del incidente no es válida",
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
    loading: "Cargando...",
    noChildrenAvailable: "No hay niños disponibles",
    finishReturn: "Finalizar y volver a la lista",
  },
} as const;

export const IncidentsCreate: React.FC = () => {
  const { language } = useLanguage();
  const t = INCIDENTS_CREATE_TRANSLATIONS[language];
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  
  const createIncidentMutation = useCreateIncident();
  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();
  const [attachments, setAttachments] = useState<any[]>([]);
  const [createdIncidentId, setCreatedIncidentId] = useState<number | null>(null);

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

  const handleFinish = async (values: any) => {
    try {
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
          message: t.errorMessage,
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
          message: t.errorMessage,
          description: t.dateInvalid,
        });
        return;
      }
      
      incidentDate = parsedDate.toISOString();
      console.log('🔍 handleFinish - formatted incidentDate:', incidentDate);

      const incidentData = {
        ...values,
        incidentDate,
      };

          await createIncidentMutation.mutateAsync(incidentData, {
            onSuccess: async (data) => {
              console.log('🔍 Create success - data:', data);

              // Set the created incident ID to enable attachments
              setCreatedIncidentId((data as any).id);

              // Use Refine's useInvalidate for proper cache invalidation (same as children)
              invalidate({
                resource: "incidents",
                invalidates: ["list"],
              });

              // Also invalidate the specific incident data
              invalidate({
                resource: "incidents",
                invalidates: ["detail"],
                id: (data as any).id,
              });

              open?.({
                type: "success",
                message: t.successMessage,
                description: t.successDesc,
              });
            },
            onError: (error: any) => {
              open?.({
                type: "error",
                message: t.errorMessage,
                description: error.response?.data?.message || error.message,
              });
            }
          });
    } catch (error: any) {
      open?.({
        type: "error",
        message: t.errorMessage,
        description: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <Create
      title={t.title}
      saveButtonProps={{
        loading: createIncidentMutation.isPending,
        children: t.save,
        onClick: () => {
          form.submit();
        },
        style: createdIncidentId ? { display: 'none' } : {},
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          incidentDate: dayjs(),
        }}
        disabled={!!createdIncidentId}
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
                onChange={(value) => setSelectedChildId(value)}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
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

      {/* Attachments Section - Only show after incident is created */}
      {createdIncidentId && (
        <div style={{ marginTop: 24 }}>
          <IncidentAttachmentsMultiple
            incidentId={createdIncidentId}
            onAttachmentsChange={setAttachments}
          />
          
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              onClick={() => {
                // Navigate back to incidents list
                go({
                  to: "/incidents",
                  type: "push",
                });
              }}
            >
              {t.finishReturn}
            </Button>
          </div>
        </div>
      )}
    </Create>
  );
};

import React, { useEffect, useState } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, Row, Col, Typography } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGo, useInvalidate, useNotification } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { useUpdateIncident } from '../../domains/incidents';
import { IncidentAttachmentsMultiple } from './attachments-multiple';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const IncidentsEdit: React.FC = () => {
  const queryClient = useQueryClient();
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  
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
        message: "Incidente actualizado exitosamente",
        description: "Los cambios se han guardado correctamente",
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
        message: "Error al actualizar el incidente",
        description: error.message || "Ha ocurrido un error inesperado",
      });
    },
  });

  const updateIncidentMutation = useUpdateIncident();
  const incidentData = formProps.initialValues;
  const [attachments, setAttachments] = useState<any[]>([]);
  
  // Set dayjs locale
  dayjs.locale('es');
  
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
        message: "Error al actualizar el incidente",
        description: "La fecha del incidente es requerida",
      });
      return;
    }
    
    // Try to parse the date
    const parsedDate = dayjs(values.incidentDate);
    if (!parsedDate.isValid()) {
      console.log('🔍 handleFinish - invalid date format:', values.incidentDate);
      open?.({
        type: "error",
        message: "Error al actualizar el incidente",
        description: "La fecha del incidente no es válida",
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

  if (formProps.loading) {
    return <div>Cargando...</div>;
  }

  if (!incidentData) {
    return <div>Incidente no encontrado</div>;
  }

  return (
    <Edit
      title="Editar Incidente"
      saveButtonProps={saveButtonProps}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Niño"
              name="childId"
              rules={[{ required: true, message: 'Por favor seleccione un niño' }]}
            >
              <Select
                placeholder="Seleccione un niño"
                showSearch
                loading={childrenLoading}
                notFoundContent={childrenLoading ? "Cargando..." : "No hay niños disponibles"}
                filterOption={(input, option) =>
                  (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
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
              label="Tipo de Incidente"
              name="incidentTypeId"
              rules={[{ required: true, message: 'Por favor seleccione un tipo de incidente' }]}
            >
              <Select
                placeholder="Seleccione un tipo de incidente"
                loading={incidentTypesLoading}
                notFoundContent={incidentTypesLoading ? "Cargando..." : "No hay tipos disponibles"}
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
              label="Título del Incidente"
              name="title"
              rules={[{ required: true, message: 'Por favor ingrese el título del incidente' }]}
            >
              <Input placeholder="Título del incidente" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Descripción del Incidente"
              name="description"
              rules={[{ required: true, message: 'Por favor ingrese la descripción del incidente' }]}
            >
              <TextArea
                rows={4}
                placeholder="Descripción detallada del incidente"
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Fecha y Hora del Incidente"
              name="incidentDate"
              rules={[{ required: true, message: 'Por favor seleccione la fecha y hora del incidente' }]}
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
                placeholder="Seleccione fecha y hora"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Ubicación"
              name="location"
            >
              <Input placeholder="Ubicación donde ocurrió el incidente" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Acción Tomada"
              name="actionTaken"
            >
              <TextArea
                rows={3}
                placeholder="Acción tomada en respuesta al incidente (opcional)"
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
          {console.log('🔍 Rendering attachments with:', { incidentId: incidentData.id, attachments })}
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
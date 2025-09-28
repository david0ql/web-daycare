import React, { useState } from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, Row, Col, Typography, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useGo, useInvalidate, useNotification } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { useCreateIncident } from '../../domains/incidents';
import { IncidentAttachmentsMultiple } from './attachments-multiple';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const IncidentsCreate: React.FC = () => {
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  
  const createIncidentMutation = useCreateIncident();
  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();
  const [attachments, setAttachments] = useState<any[]>([]);
  const [createdIncidentId, setCreatedIncidentId] = useState<number | null>(null);

  // Set dayjs locale
  dayjs.locale('es');

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
          message: "Error al crear el incidente",
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
          message: "Error al crear el incidente",
          description: "La fecha del incidente no es válida",
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
                message: "Incidente creado exitosamente",
                description: "El incidente ha sido registrado correctamente. Ahora puedes agregar adjuntos.",
              });
            },
            onError: (error: any) => {
              open?.({
                type: "error",
                message: "Error al crear el incidente",
                description: error.response?.data?.message || error.message,
              });
            }
          });
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error al crear el incidente",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <Create
      title="Crear Incidente"
      saveButtonProps={{
        loading: createIncidentMutation.isPending,
        onClick: () => {
          // Submit the form using Antd's form instance
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
              label="Niño"
              name="childId"
              rules={[{ required: true, message: 'Por favor seleccione un niño' }]}
            >
              <Select
                placeholder="Seleccione un niño"
                showSearch
                loading={childrenLoading}
                notFoundContent={childrenLoading ? "Cargando..." : "No hay niños disponibles"}
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
              Finalizar y volver a la lista
            </Button>
          </div>
        </div>
      )}
    </Create>
  );
};
import React, { useEffect } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, Row, Col, Typography, message } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGo, useInvalidate } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { useUpdateIncident } from '../../domains/incidents';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const IncidentsEdit: React.FC = () => {
  const queryClient = useQueryClient();
  const go = useGo();
  const invalidate = useInvalidate();
  
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: 'incidents',
    onMutationSuccess: async (data) => {
      // Use Refine's useInvalidate for proper cache invalidation
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
      
      // Force invalidate and refetch all incidents-related queries
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "incidents");
        },
      });
      
      // Force refetch all incidents queries
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "incidents");
        },
      });
      
      message.success('Incidente actualizado exitosamente');
      
      // Navigate back to incidents list
      setTimeout(() => {
        go({
          to: "/incidents",
          type: "push",
        });
      }, 1000);
    },
  });

  const updateIncidentMutation = useUpdateIncident();
  const incidentData = queryResult?.data?.data;

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

  useEffect(() => {
    if (incidentData) {
      formProps.form?.setFieldsValue({
        childId: incidentData.childId,
        incidentTypeId: incidentData.incidentTypeId,
        title: incidentData.title,
        description: incidentData.description,
        incidentDate: incidentData.incidentDate ? dayjs(incidentData.incidentDate) : undefined,
        location: incidentData.location,
        actionTaken: incidentData.actionTaken,
      });
    }
  }, [incidentData, formProps.form]);

  const handleFinish = async (values: any) => {
    try {
      const incidentData = {
        ...values,
        incidentDate: values.incidentDate.toISOString(),
      };

      await updateIncidentMutation.mutateAsync({
        id: incidentData.id,
        data: incidentData,
      });
    } catch (error: any) {
      message.error('Error al actualizar el incidente: ' + (error.response?.data?.message || error.message));
    }
  };

  if (queryResult?.isLoading) {
    return <div>Cargando...</div>;
  }

  if (!incidentData) {
    return <div>Incidente no encontrado</div>;
  }

  return (
    <Edit
      title="Editar Incidente"
      saveButtonProps={{
        ...saveButtonProps,
        onClick: () => formProps.form?.submit(),
      }}
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
    </Edit>
  );
};
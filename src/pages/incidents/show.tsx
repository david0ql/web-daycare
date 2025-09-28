import React from 'react';
import { Show, EditButton, DeleteButton } from '@refinedev/antd';
import { useOne } from '@refinedev/core';
import { Typography, Card, Row, Col, Tag, Space, Button, Image, Divider, message } from 'antd';
import { BellOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMarkParentNotified, useDeleteIncident, getSeverityColor, getSeverityLabel, formatIncidentDate, getIncidentStatus, getAttachmentUrl } from '../../domains/incidents';
import { useQueryClient } from '@tanstack/react-query';
import { IncidentAttachments } from './attachments';

const { Title, Text, Paragraph } = Typography;

export const IncidentsShow: React.FC = () => {
  const { data, isLoading } = useOne({
    resource: 'incidents',
  });
  const incident = data?.data;

  const queryClient = useQueryClient();
  const markParentNotifiedMutation = useMarkParentNotified();
  const deleteIncidentMutation = useDeleteIncident();

  const handleMarkParentNotified = async () => {
    try {
      await markParentNotifiedMutation.mutateAsync({ incidentId: incident.id });
      message.success('Incidente marcado como notificado a padres');
    } catch (error) {
      message.error('Error al marcar como notificado');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIncidentMutation.mutateAsync(incident.id);
      message.success('Incidente eliminado exitosamente');
    } catch (error) {
      message.error('Error al eliminar el incidente');
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!incident) {
    return <div>Incidente no encontrado</div>;
  }

  const status = getIncidentStatus(incident.parentNotified);

  return (
    <Show
      title="Detalles del Incidente"
      headerButtons={[
        <EditButton key="edit" icon={<EditOutlined />} />,
        !incident.parentNotified && (
          <Button
            key="notify"
            type="primary"
            icon={<BellOutlined />}
            onClick={handleMarkParentNotified}
            loading={markParentNotifiedMutation.isPending}
          >
            Marcar como Notificado
          </Button>
        ),
        <DeleteButton
          key="delete"
          icon={<DeleteOutlined />}
          onConfirm={handleDelete}
          confirmTitle="¿Está seguro de que desea eliminar este incidente?"
          confirmOkText="Sí, eliminar"
          confirmCancelText="Cancelar"
        />,
      ]}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Información General">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>ID del Incidente:</Text>
                <br />
                <Text>{incident.id}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Estado:</Text>
                <br />
                <Tag color={status.status}>{status.text}</Tag>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Detalles del Incidente">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Título:</Text>
                <br />
                <Text>{incident.title}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Fecha del Incidente:</Text>
                <br />
                <Text>{formatIncidentDate(incident.incidentDate)}</Text>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Niño:</Text>
                <br />
                <Text>{incident.child?.firstName} {incident.child?.lastName}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ubicación:</Text>
                <br />
                <Text>{incident.location || 'No especificada'}</Text>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Tipo de Incidente:</Text>
                <br />
                <Space>
                  <Text>{incident.incidentType?.name}</Text>
                  <Tag color={getSeverityColor(incident.incidentType?.severityLevel)}>
                    {getSeverityLabel(incident.incidentType?.severityLevel)}
                  </Tag>
                </Space>
              </Col>
              <Col span={12}>
                <Text strong>Reportado por:</Text>
                <br />
                <Text>{incident.reportedBy2?.firstName} {incident.reportedBy2?.lastName}</Text>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Descripción">
            <Paragraph>{incident.description}</Paragraph>
          </Card>
        </Col>

        {incident.actionTaken && (
          <Col span={24}>
            <Card title="Acción Tomada">
              <Paragraph>{incident.actionTaken}</Paragraph>
            </Card>
          </Col>
        )}

        <Col span={24}>
          <Card title="Adjuntos">
            <IncidentAttachments
              incidentId={incident.id}
              attachments={incident.incidentAttachments || []}
              onAttachmentsChange={() => {
                // Refresh the incident data
                queryClient.invalidateQueries({
                  predicate: (query) => {
                    const key = query.queryKey;
                    return Array.isArray(key) && key.some(k => k === "incidents");
                  },
                });
              }}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Información del Sistema">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Creado:</Text>
                <br />
                <Text>{new Date(incident.createdAt).toLocaleString()}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Última actualización:</Text>
                <br />
                <Text>{new Date(incident.updatedAt).toLocaleString()}</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
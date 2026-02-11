import React from 'react';
import { Show, EditButton, DeleteButton } from '@refinedev/antd';
import { useOne } from '@refinedev/core';
import { Typography, Card, Row, Col, Tag, Space, Button, Image, Divider, message } from 'antd';
import { BellOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMarkParentNotified, useDeleteIncident, getSeverityColor, getSeverityLabelByLanguage, formatIncidentDate, getIncidentStatusByLanguage } from '../../domains/incidents';
import { useQueryClient } from '@tanstack/react-query';
import { IncidentAttachments } from './attachments';
import { useLanguage } from '../../shared/contexts/language.context';
import { getIntlLocale } from '../../shared/i18n/locale';

const { Title, Text, Paragraph } = Typography;

const INCIDENTS_SHOW_TRANSLATIONS = {
  english: {
    title: "Incident Details",
    loading: "Loading...",
    notFound: "Incident not found",
    notifiedSuccess: "Incident marked as notified to parents",
    notifiedError: "Error marking as notified",
    deleteSuccess: "Incident deleted successfully",
    deleteError: "Error deleting incident",
    markNotified: "Mark as Notified",
    deleteConfirm: "Are you sure you want to delete this incident?",
    deleteOk: "Yes, delete",
    cancel: "Cancel",
    generalInfo: "General Information",
    incidentId: "Incident ID",
    status: "Status",
    details: "Incident Details",
    titleLabel: "Title",
    incidentDate: "Incident Date",
    child: "Child",
    location: "Location",
    notSpecified: "Not specified",
    incidentType: "Incident Type",
    reportedBy: "Reported by",
    description: "Description",
    actionTaken: "Action Taken",
    attachments: "Attachments",
    systemInfo: "System Information",
    created: "Created",
    lastUpdated: "Last updated",
  },
  spanish: {
    title: "Detalles del incidente",
    loading: "Cargando...",
    notFound: "Incidente no encontrado",
    notifiedSuccess: "Incidente marcado como notificado a padres",
    notifiedError: "Error al marcar como notificado",
    deleteSuccess: "Incidente eliminado correctamente",
    deleteError: "Error al eliminar el incidente",
    markNotified: "Marcar como notificado",
    deleteConfirm: "¿Está seguro de eliminar este incidente?",
    deleteOk: "Sí, eliminar",
    cancel: "Cancelar",
    generalInfo: "Información general",
    incidentId: "ID del incidente",
    status: "Estado",
    details: "Detalles del incidente",
    titleLabel: "Título",
    incidentDate: "Fecha del incidente",
    child: "Niño",
    location: "Ubicación",
    notSpecified: "No especificado",
    incidentType: "Tipo de incidente",
    reportedBy: "Reportado por",
    description: "Descripción",
    actionTaken: "Acción tomada",
    attachments: "Adjuntos",
    systemInfo: "Información del sistema",
    created: "Creado",
    lastUpdated: "Última actualización",
  },
} as const;

export const IncidentsShow: React.FC = () => {
  const { language } = useLanguage();
  const t = INCIDENTS_SHOW_TRANSLATIONS[language];
  const { result: incident, query: incidentQuery } = useOne({
    resource: 'incidents',
  }) as any;
  const isLoading = incidentQuery.isLoading;

  const queryClient = useQueryClient();
  const markParentNotifiedMutation = useMarkParentNotified();
  const deleteIncidentMutation = useDeleteIncident();

  const handleMarkParentNotified = async () => {
    try {
      await markParentNotifiedMutation.mutateAsync({ incidentId: incident.id });
      message.success(t.notifiedSuccess);
    } catch (error) {
      message.error(t.notifiedError);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIncidentMutation.mutateAsync(incident.id);
      message.success(t.deleteSuccess);
    } catch (error) {
      message.error(t.deleteError);
    }
  };

  if (isLoading) {
    return <div>{t.loading}</div>;
  }

  if (!incident) {
    return <div>{t.notFound}</div>;
  }

  const status = getIncidentStatusByLanguage(incident.parentNotified, language);
  const intlLocale = getIntlLocale(language);

  return (
    <Show
      title={t.title}
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
            {t.markNotified}
          </Button>
        ),
        <DeleteButton
          key="delete"
          icon={<DeleteOutlined />}
          confirmTitle={t.deleteConfirm}
          confirmOkText={t.deleteOk}
          confirmCancelText={t.cancel}
        />,
      ]}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={t.generalInfo}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>{t.incidentId}:</Text>
                <br />
                <Text>{incident.id}</Text>
              </Col>
              <Col span={12}>
                <Text strong>{t.status}:</Text>
                <br />
                <Tag color={status.status}>{status.text}</Tag>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title={t.details}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>{t.titleLabel}:</Text>
                <br />
                <Text>{incident.title}</Text>
              </Col>
              <Col span={12}>
                <Text strong>{t.incidentDate}:</Text>
                <br />
                <Text>{formatIncidentDate(incident.incidentDate)}</Text>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>{t.child}:</Text>
                <br />
                <Text>{incident.child?.firstName} {incident.child?.lastName}</Text>
              </Col>
              <Col span={12}>
                <Text strong>{t.location}:</Text>
                <br />
                <Text>{incident.location || t.notSpecified}</Text>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>{t.incidentType}:</Text>
                <br />
                <Space>
                  <Text>{incident.incidentType?.name}</Text>
                  <Tag color={getSeverityColor(incident.incidentType?.severityLevel)}>
                    {getSeverityLabelByLanguage(incident.incidentType?.severityLevel, language)}
                  </Tag>
                </Space>
              </Col>
              <Col span={12}>
                <Text strong>{t.reportedBy}:</Text>
                <br />
                <Text>{incident.reportedBy2?.firstName} {incident.reportedBy2?.lastName}</Text>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title={t.description}>
            <Paragraph>{incident.description}</Paragraph>
          </Card>
        </Col>

        {incident.actionTaken && (
          <Col span={24}>
            <Card title={t.actionTaken}>
              <Paragraph>{incident.actionTaken}</Paragraph>
            </Card>
          </Col>
        )}

        <Col span={24}>
          <Card title={t.attachments}>
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
          <Card title={t.systemInfo}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>{t.created}:</Text>
                <br />
                <Text>{new Date(incident.createdAt).toLocaleString(intlLocale)}</Text>
              </Col>
              <Col span={12}>
                <Text strong>{t.lastUpdated}:</Text>
                <br />
                <Text>{new Date(incident.updatedAt).toLocaleString(intlLocale)}</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};

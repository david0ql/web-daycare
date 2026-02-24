import React from 'react';
import { useParams } from 'react-router';
import { Show, EditButton, DeleteButton } from '@refinedev/antd';
import { useOne } from '@refinedev/core';
import { Form, Input, Row, Col, Typography, Button, List, Image } from 'antd';
import { BellOutlined, EditOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { useMarkParentNotified, getSeverityLabelByLanguage, getIncidentTypeLabelByLanguage, formatIncidentDateByLanguage, getAttachmentUrl } from '../../domains/incidents';
import { message } from 'antd';
import { useLanguage } from '../../shared/contexts/language.context';

const { TextArea } = Input;
const { Text } = Typography;

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
    child: "Child",
    incidentType: "Incident Type",
    incidentTitle: "Incident Title",
    incidentDescription: "Incident Description",
    incidentDateTime: "Incident Date and Time",
    location: "Location",
    locationPlaceholder: "Location where the incident occurred",
    actionTaken: "Action Taken",
    actionTakenPlaceholder: "Action taken in response to the incident (optional)",
    attachmentsTitle: "Incident Attachments",
    noAttachments: "No attachments",
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
    child: "Niño",
    incidentType: "Tipo de incidente",
    incidentTitle: "Título del incidente",
    incidentDescription: "Descripción del incidente",
    incidentDateTime: "Fecha y hora del incidente",
    location: "Ubicación",
    locationPlaceholder: "Ubicación donde ocurrió el incidente",
    actionTaken: "Acción tomada",
    actionTakenPlaceholder: "Acción tomada en respuesta al incidente (opcional)",
    attachmentsTitle: "Adjuntos del incidente",
    noAttachments: "Sin adjuntos",
  },
} as const;

export const IncidentsShow: React.FC = () => {
  const { language } = useLanguage();
  const t = INCIDENTS_SHOW_TRANSLATIONS[language];
  const { id: idFromUrl } = useParams<{ id: string }>();
  const incidentId = idFromUrl != null ? (Number(idFromUrl) || idFromUrl) : undefined;

  const { result: incident, query: incidentQuery } = useOne({
    resource: 'incidents',
    id: incidentId,
  }) as any;

  const isLoading = incidentQuery.isLoading;
  const markParentNotifiedMutation = useMarkParentNotified();

  const handleMarkParentNotified = async () => {
    try {
      await markParentNotifiedMutation.mutateAsync({ incidentId: incident.id });
      message.success(t.notifiedSuccess);
    } catch (error) {
      message.error(t.notifiedError);
    }
  };

  if (incidentId == null || incidentId === '') {
    return (
      <Show title={t.title}>
        <div>{t.notFound}</div>
      </Show>
    );
  }

  if (isLoading) {
    return (
      <Show title={t.title}>
        <div>{t.loading}</div>
      </Show>
    );
  }

  if (!incident) {
    return (
      <Show title={t.title}>
        <div>{t.notFound}</div>
      </Show>
    );
  }

  const attachments = incident.incidentAttachments || [];
  const incidentTypeDisplay = incident.incidentType
    ? `${getIncidentTypeLabelByLanguage(incident.incidentType.name, language)} - ${getSeverityLabelByLanguage(incident.incidentType.severityLevel, language)}`
    : '';

  return (
    <Show
      title={t.title}
      headerButtons={[
        // <EditButton key="edit" icon={<EditOutlined />} />,
        // !incident.parentNotified && (
        //   <Button
        //     key="notify"
        //     type="primary"
        //     icon={<BellOutlined />}
        //     onClick={handleMarkParentNotified}
        //     loading={markParentNotifiedMutation.isPending}
        //   >
        //     {t.markNotified}
        //   </Button>
        // ),
        // <DeleteButton
        //   key="delete"
        //   icon={<DeleteOutlined />}
        //   confirmTitle={t.deleteConfirm}
        //   confirmOkText={t.deleteOk}
        //   confirmCancelText={t.cancel}
        // />,
      ]}
    >
      <Form layout="vertical" initialValues={{
        childId: incident.child ? `${incident.child.firstName} ${incident.child.lastName}` : '',
        incidentTypeId: incidentTypeDisplay,
        title: incident.title,
        description: incident.description,
        incidentDate: incident.incidentDate ? formatIncidentDateByLanguage(incident.incidentDate, language) : '',
        location: incident.location || '',
        actionTaken: incident.actionTaken || '',
      }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t.child} name="childId">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t.incidentType} name="incidentTypeId">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={t.incidentTitle} name="title">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={t.incidentDescription} name="description">
              <TextArea rows={4} disabled style={{ resize: 'none' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t.incidentDateTime} name="incidentDate">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t.location} name="location">
              <Input disabled placeholder={t.locationPlaceholder} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={t.actionTaken} name="actionTaken">
              <TextArea rows={3} disabled placeholder={t.actionTakenPlaceholder} style={{ resize: 'none' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* Adjuntos: solo lectura, sin subida */}
      <div style={{ marginTop: 24 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.attachmentsTitle}</Text>
        {attachments.length === 0 ? (
          <Text type="secondary">{t.noAttachments}</Text>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={attachments}
            renderItem={(att: any) => (
              <List.Item>
                {att.fileType === 'image' ? (
                  <Image
                    width="100%"
                    height={120}
                    src={getAttachmentUrl(att.filePath)}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                  />
                ) : (
                  <a
                    href={getAttachmentUrl(att.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, border: '1px solid #d9d9d9', borderRadius: 8 }}
                  >
                    <FileOutlined style={{ fontSize: 24 }} />
                    <Text ellipsis style={{ flex: 1 }}>{att.filename}</Text>
                  </a>
                )}
              </List.Item>
            )}
          />
        )}
      </div>
    </Show>
  );
};

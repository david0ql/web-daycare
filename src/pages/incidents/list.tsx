import React from 'react';
import { List, EditButton, DeleteButton, ShowButton, CreateButton, useTable } from '@refinedev/antd';
import { Table, Space, Tag, Button, Tooltip, Image, Typography } from 'antd';
import { PlusOutlined, BellOutlined } from '@ant-design/icons';
import { useDeleteIncident } from '../../domains/incidents';
import { getSeverityColor, getSeverityLabelByLanguage, getIncidentTypeLabelByLanguage, formatIncidentDateByLanguage, getIncidentStatusByLanguage, getAttachmentUrl } from '../../domains/incidents';
import { useInvalidate, useCustomMutation, useNotification } from '@refinedev/core';
import { useLanguage } from '../../shared/contexts/language.context';

const { Text } = Typography;

const INCIDENTS_LIST_TRANSLATIONS = {
  english: {
    title: "Incidents List",
    createIncident: "Create Incident",
    id: "ID",
    titleCol: "Title",
    child: "Child",
    type: "Type",
    incidentDate: "Incident Date",
    location: "Location",
    status: "Status",
    attachments: "Attachments",
    noAttachments: "No attachments",
    reportedBy: "Reported by",
    actions: "Actions",
    markNotified: "Mark as notified to parents",
    deleteConfirm: "Are you sure you want to delete this incident?",
    deleteOk: "Yes, delete",
    cancel: "Cancel",
    notifiedSuccess: "Incident marked as notified to parents",
    notifiedDesc: "The parent has been notified correctly",
    notifiedError: "Error marking as notified",
    deleteSuccess: "Incident deleted successfully",
    deleteDesc: "The incident has been deleted correctly",
    deleteError: "Error deleting incident",
  },
  spanish: {
    title: "Lista de incidentes",
    createIncident: "Crear incidente",
    id: "ID",
    titleCol: "Título",
    child: "Niño",
    type: "Tipo",
    incidentDate: "Fecha del incidente",
    location: "Ubicación",
    status: "Estado",
    attachments: "Adjuntos",
    noAttachments: "Sin adjuntos",
    reportedBy: "Reportado por",
    actions: "Acciones",
    markNotified: "Marcar como notificado a padres",
    deleteConfirm: "¿Está seguro de eliminar este incidente?",
    deleteOk: "Sí, eliminar",
    cancel: "Cancelar",
    notifiedSuccess: "Incidente marcado como notificado a padres",
    notifiedDesc: "El padre ha sido notificado correctamente",
    notifiedError: "Error al marcar como notificado",
    deleteSuccess: "Incidente eliminado correctamente",
    deleteDesc: "El incidente ha sido eliminado correctamente",
    deleteError: "Error al eliminar el incidente",
  },
} as const;

export const IncidentsList: React.FC = () => {
  const { language } = useLanguage();
  const t = INCIDENTS_LIST_TRANSLATIONS[language];
  const { tableProps } = useTable({
    syncWithLocation: false,
    sorters: {
      initial: [
        {
          field: "id",
          order: "desc",
        },
      ],
    },
  });

  const invalidate = useInvalidate();
  const { open } = useNotification();
  const markParentNotifiedMutation = useCustomMutation();
  const deleteIncidentMutation = useDeleteIncident();

  const handleMarkParentNotified = async (incidentId: number) => {
    try {
      
      await markParentNotifiedMutation.mutateAsync({
        url: '/incidents/mark-parent-notified',
        method: 'post',
        values: { incidentId },
        successNotification: false,
      });
      

      // Use Refine's useInvalidate for proper cache invalidation (same as children)
      invalidate({
        resource: "incidents",
        invalidates: ["list"],
      });
      
      open?.({
        type: "success",
        message: t.notifiedSuccess,
        description: t.notifiedDesc,
      });
    } catch (error) {
      open?.({
        type: "error",
        message: t.notifiedError,
        description: t.notifiedError,
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      
      await deleteIncidentMutation.mutateAsync(id);
      

      // Use Refine's useInvalidate for proper cache invalidation (same as children)
      invalidate({
        resource: "incidents",
        invalidates: ["list"],
      });
      
      open?.({
        type: "success",
        message: t.deleteSuccess,
        description: t.deleteDesc,
      });
    } catch (error) {
      open?.({
        type: "error",
        message: t.deleteError,
        description: t.deleteError,
      });
    }
  };

  const columns = [
    {
      title: t.id,
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: t.titleCol,
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t.child,
      key: 'child',
      render: (record: any) => (
        <Text>
          {record.child?.firstName} {record.child?.lastName}
        </Text>
      ),
    },
    {
      title: t.type,
      key: 'incidentType',
      render: (record: any) => (
        <div>
          <Text strong>{getIncidentTypeLabelByLanguage(record.incidentType?.name, language)}</Text>
          <br />
          <Tag color={getSeverityColor(record.incidentType?.severityLevel)}>
            {getSeverityLabelByLanguage(record.incidentType?.severityLevel, language)}
          </Tag>
        </div>
      ),
    },
    {
      title: t.incidentDate,
      dataIndex: 'incidentDate',
      key: 'incidentDate',
      render: (date: string) => formatIncidentDateByLanguage(date, language),
      sorter: true,
    },
    {
      title: t.location,
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
    },
    {
      title: t.status,
      key: 'parentNotified',
      render: (record: any) => {
        const status = getIncidentStatusByLanguage(record.parentNotified, language);
        return (
          <Tag color={status.status}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: t.attachments,
      key: 'attachments',
      render: (record: any) => {
        const attachments = record.incidentAttachments || [];
        if (attachments.length === 0) {
          return <Text type="secondary">{t.noAttachments}</Text>;
        }
        
        return (
          <Space>
            {attachments.slice(0, 2).map((attachment: any) => (
              <Tooltip key={attachment.id} title={attachment.filename}>
                {attachment.fileType === 'image' ? (
                  <Image
                    width={32}
                    height={32}
                    src={getAttachmentUrl(attachment.filePath)}
                    style={{ borderRadius: 4 }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                  />
                ) : (
                  <Text>📄</Text>
                )}
              </Tooltip>
            ))}
            {attachments.length > 2 && (
              <Text type="secondary">+{attachments.length - 2}</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: t.reportedBy,
      key: 'reportedBy2',
      render: (record: any) => (
        <Text>
          {record.reportedBy2?.firstName} {record.reportedBy2?.lastName}
        </Text>
      ),
    },
    {
      title: t.actions,
      key: 'actions',
      render: (record: any) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          <EditButton hideText size="small" recordItemId={record.id} />
          {!record.parentNotified && (
            <Tooltip title={t.markNotified}>
              <Button
                type="link"
                size="small"
                icon={<BellOutlined />}
                onClick={() => handleMarkParentNotified(record.id)}
              />
            </Tooltip>
          )}
          <DeleteButton
            hideText
            size="small"
            recordItemId={record.id}
            confirmTitle={t.deleteConfirm}
            confirmOkText={t.deleteOk}
            confirmCancelText={t.cancel}
          />
        </Space>
      ),
    },
  ];

  return (
    <List
      title={t.title}
      headerButtons={[
        <CreateButton key="create" icon={<PlusOutlined />}>
          {t.createIncident}
        </CreateButton>,
      ]}
    >
      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1200 }}
      />
    </List>
  );
};

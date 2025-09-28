import React, { useState } from 'react';
import { List, EditButton, DeleteButton, ShowButton, CreateButton, useTable } from '@refinedev/antd';
import { Table, Space, Tag, Button, Tooltip, Image, Typography } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, BellOutlined } from '@ant-design/icons';
import { useIncidents, useDeleteIncident } from '../../domains/incidents';
import { getSeverityColor, getSeverityLabel, formatIncidentDate, getIncidentStatus, getAttachmentUrl } from '../../domains/incidents';
import { useInvalidate, useCustomMutation, useNotification } from '@refinedev/core';

const { Text } = Typography;

export const IncidentsList: React.FC = () => {
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
      console.log('🔍 Mark parent notified - incidentId:', incidentId);
      
      await markParentNotifiedMutation.mutateAsync({
        url: '/incidents/mark-parent-notified',
        method: 'post',
        values: { incidentId },
        successNotification: false,
      });
      
      console.log('🔍 Mark parent notified - mutation successful');

      // Use Refine's useInvalidate for proper cache invalidation (same as children)
      invalidate({
        resource: "incidents",
        invalidates: ["list"],
      });
      
      open?.({
        type: "success",
        message: "Incidente marcado como notificado a padres",
        description: "El padre ha sido notificado correctamente",
      });
    } catch (error) {
      console.log('🔍 Mark parent notified - error:', error);
      open?.({
        type: "error",
        message: "Error al marcar como notificado",
        description: "No se pudo notificar al padre. Intenta nuevamente.",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      console.log('🔍 Delete incident - id:', id);
      
      await deleteIncidentMutation.mutateAsync(id);
      
      console.log('🔍 Delete incident - mutation successful');

      // Use Refine's useInvalidate for proper cache invalidation (same as children)
      invalidate({
        resource: "incidents",
        invalidates: ["list"],
      });
      
      open?.({
        type: "success",
        message: "Incidente eliminado exitosamente",
        description: "El incidente ha sido eliminado correctamente",
      });
    } catch (error) {
      console.log('🔍 Delete incident - error:', error);
      open?.({
        type: "error",
        message: "Error al eliminar el incidente",
        description: "No se pudo eliminar el incidente. Intenta nuevamente.",
      });
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Niño',
      key: 'child',
      render: (record: any) => (
        <Text>
          {record.child?.firstName} {record.child?.lastName}
        </Text>
      ),
    },
    {
      title: 'Tipo',
      key: 'incidentType',
      render: (record: any) => (
        <div>
          <Text strong>{record.incidentType?.name}</Text>
          <br />
          <Tag color={getSeverityColor(record.incidentType?.severityLevel)}>
            {getSeverityLabel(record.incidentType?.severityLevel)}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Fecha del Incidente',
      dataIndex: 'incidentDate',
      key: 'incidentDate',
      render: (date: string) => formatIncidentDate(date),
      sorter: true,
    },
    {
      title: 'Ubicación',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
    },
    {
      title: 'Estado',
      key: 'parentNotified',
      render: (record: any) => {
        const status = getIncidentStatus(record.parentNotified);
        return (
          <Tag color={status.status}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: 'Adjuntos',
      key: 'attachments',
      render: (record: any) => {
        const attachments = record.incidentAttachments || [];
        if (attachments.length === 0) {
          return <Text type="secondary">Sin adjuntos</Text>;
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
      title: 'Reportado por',
      key: 'reportedBy2',
      render: (record: any) => (
        <Text>
          {record.reportedBy2?.firstName} {record.reportedBy2?.lastName}
        </Text>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          <EditButton hideText size="small" recordItemId={record.id} />
          {!record.parentNotified && (
            <Tooltip title="Marcar como notificado a padres">
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
            confirmTitle="¿Está seguro de que desea eliminar este incidente?"
            confirmOkText="Sí, eliminar"
            confirmCancelText="Cancelar"
          />
        </Space>
      ),
    },
  ];

  return (
    <List
      title="Incidentes"
      headerButtons={[
        <CreateButton key="create" icon={<PlusOutlined />}>
          Crear Incidente
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

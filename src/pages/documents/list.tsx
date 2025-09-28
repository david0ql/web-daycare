import React from 'react';
import { List, DeleteButton, CreateButton, useTable } from '@refinedev/antd';
import { Table, Space, Tag, Button, Tooltip, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useDeleteDocument } from '../../domains/documents';
import { 
  formatDocumentDate, 
  formatExpirationDate, 
  getExpirationColor, 
  getExpirationLabel, 
  formatFileSize, 
  getFileIcon,
  getDocumentUrl 
} from '../../domains/documents';
import { useInvalidate, useNotification } from '@refinedev/core';
import { useQueryClient } from '@tanstack/react-query';
import { clearDataProviderCache } from '../../dataProvider-stable-fixed';

const { Text } = Typography;

export const DocumentList: React.FC = () => {
  const { tableProps } = useTable({
    resource: "documents",
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

  console.log('🔍 DocumentList - tableProps:', tableProps);
  console.log('🔍 DocumentList - tableProps.dataSource:', tableProps.dataSource);
  console.log('🔍 DocumentList - tableProps.loading:', tableProps.loading);

  const invalidate = useInvalidate();
  const { open } = useNotification();
  const queryClient = useQueryClient();
  const deleteDocumentMutation = useDeleteDocument();

  const handleDelete = async (id: number) => {
    try {
      console.log('🔍 Delete document - id:', id);
      
      await deleteDocumentMutation.mutateAsync(id);
      
      console.log('🔍 Delete document - mutation successful');

      // Clear dataProvider cache first
      clearDataProviderCache("documents");

      // Invalidate React Query cache directly
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      });
      
      // Also use Refine's useInvalidate for consistency
      invalidate({
        resource: "documents",
        invalidates: ["list"],
      });
      
      open?.({
        type: "success",
        message: "Documento eliminado exitosamente",
        description: "El documento ha sido eliminado correctamente",
      });
    } catch (error) {
      console.log('🔍 Delete document - error:', error);
      open?.({
        type: "error",
        message: "Error al eliminar el documento",
        description: "No se pudo eliminar el documento. Intenta nuevamente.",
      });
    }
  };

  const handleDownload = (record: any) => {
    const documentUrl = getDocumentUrl(record.filename);
    window.open(documentUrl, '_blank');
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: 'Niño',
      dataIndex: ['child', 'firstName'],
      render: (value: any, record: any) => `${record.child.firstName} ${record.child.lastName}`,
      sorter: (a: any, b: any) => a.child.firstName.localeCompare(b.child.firstName),
    },
    {
      title: 'Tipo de Documento',
      dataIndex: ['documentType', 'name'],
      sorter: (a: any, b: any) => a.documentType.name.localeCompare(b.documentType.name),
    },
    {
      title: 'Archivo',
      dataIndex: 'originalFilename',
      render: (value: string, record: any) => (
        <Space>
          <span>{getFileIcon(record.mimeType)}</span>
          <Text>{value}</Text>
          <Text type="secondary">({formatFileSize(record.fileSize)})</Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.originalFilename.localeCompare(b.originalFilename),
    },
    {
      title: 'Fecha de Subida',
      dataIndex: 'createdAt',
      render: (value: string) => formatDocumentDate(value),
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Fecha de Expiración',
      dataIndex: 'expiresAt',
      render: (value: string | null, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>{formatExpirationDate(value)}</Text>
          <Tag color={getExpirationColor(record)}>
            {getExpirationLabel(record)}
          </Tag>
        </Space>
      ),
      sorter: (a: any, b: any) => {
        if (!a.expiresAt && !b.expiresAt) return 0;
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      },
    },
    {
      title: 'Subido por',
      dataIndex: ['uploadedBy2', 'firstName'],
      render: (value: any, record: any) => `${record.uploadedBy2.firstName} ${record.uploadedBy2.lastName}`,
      sorter: (a: any, b: any) => a.uploadedBy2.firstName.localeCompare(b.uploadedBy2.firstName),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="Descargar documento">
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <DeleteButton
            hideText
            size="small"
            recordItemId={record.id}
            confirmTitle="¿Está seguro de que desea eliminar este documento?"
            confirmOkText="Sí, eliminar"
            confirmCancelText="Cancelar"
          />
        </Space>
      ),
    },
  ];

  return (
    <List
      title="Documentos"
      headerButtons={[
        <CreateButton key="create" icon={<PlusOutlined />}>
          Subir Documento
        </CreateButton>,
      ]}
    >
          <Table
            {...tableProps}
            columns={columns}
            rowKey="id"
            scroll={{ x: 1400 }}
          />
    </List>
  );
};

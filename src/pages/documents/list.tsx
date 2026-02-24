import React from 'react';
import { List, DeleteButton, CreateButton, ShowButton, EditButton, useTable } from '@refinedev/antd';
import { Table, Space, Tag, Button, Tooltip, Typography } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useDeleteDocument } from '../../domains/documents';
import { 
  formatDocumentDateByLanguage, 
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
import { useLanguage } from '../../shared/contexts/language.context';

const { Text } = Typography;

const DOCUMENT_LIST_TRANSLATIONS = {
  english: {
    title: "Documents",
    uploadDocument: "Upload Document",
    id: "ID",
    child: "Child",
    documentType: "Document Type",
    file: "File",
    uploadDate: "Upload Date",
    expirationDate: "Expiration Date",
    uploadedBy: "Uploaded by",
    actions: "Actions",
    download: "Download document",
    deleteConfirm: "Are you sure you want to delete this document?",
    deleteOk: "Yes, delete",
    cancel: "Cancel",
    deleteSuccess: "Document deleted successfully",
    deleteDesc: "The document has been deleted correctly",
    deleteError: "Error deleting document",
  },
  spanish: {
    title: "Documentos",
    uploadDocument: "Subir documento",
    id: "ID",
    child: "Niño",
    documentType: "Tipo de documento",
    file: "Archivo",
    uploadDate: "Fecha de subida",
    expirationDate: "Fecha de vencimiento",
    uploadedBy: "Subido por",
    actions: "Acciones",
    download: "Descargar documento",
    deleteConfirm: "¿Está seguro de eliminar este documento?",
    deleteOk: "Sí, eliminar",
    cancel: "Cancelar",
    deleteSuccess: "Documento eliminado correctamente",
    deleteDesc: "El documento ha sido eliminado correctamente",
    deleteError: "Error al eliminar el documento",
  },
} as const;

export const DocumentList: React.FC = () => {
  const { language } = useLanguage();
  const t = DOCUMENT_LIST_TRANSLATIONS[language];
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


  const invalidate = useInvalidate();
  const { open } = useNotification();
  const queryClient = useQueryClient();
  const deleteDocumentMutation = useDeleteDocument();

  const handleDelete = async (id: number) => {
    try {
      
      await deleteDocumentMutation.mutateAsync(id);
      

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

  const handleDownload = (record: any) => {
    const documentUrl = getDocumentUrl(record.filename);
    window.open(documentUrl, '_blank');
  };

  const columns = [
    {
      title: t.id,
      dataIndex: 'id',
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: t.child,
      dataIndex: ['child', 'firstName'],
      render: (value: any, record: any) => `${record.child.firstName} ${record.child.lastName}`,
      sorter: (a: any, b: any) => a.child.firstName.localeCompare(b.child.firstName),
    },
    {
      title: t.documentType,
      dataIndex: ['documentType', 'name'],
      sorter: (a: any, b: any) => a.documentType.name.localeCompare(b.documentType.name),
    },
    {
      title: t.file,
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
      title: t.uploadDate,
      dataIndex: 'createdAt',
      render: (value: string) => formatDocumentDateByLanguage(value, language),
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: t.expirationDate,
      dataIndex: 'expiresAt',
      render: (value: string | null, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>{formatExpirationDate(value, language)}</Text>
          <Tag color={getExpirationColor(record)}>
            {getExpirationLabel(record, language)}
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
      title: t.uploadedBy,
      dataIndex: ['uploadedBy2', 'firstName'],
      render: (value: any, record: any) => `${record.uploadedBy2.firstName} ${record.uploadedBy2.lastName}`,
      sorter: (a: any, b: any) => a.uploadedBy2.firstName.localeCompare(b.uploadedBy2.firstName),
    },
    {
      title: t.actions,
      key: 'actions',
      render: (record: any) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          <EditButton hideText size="small" recordItemId={record.id} />
          <Tooltip title={t.download}>
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
          {t.uploadDocument}
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

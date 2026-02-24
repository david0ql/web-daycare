import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Select, DatePicker, Row, Col, Upload, Button, Space, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useGo, useInvalidate, useNotification } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { useUpdateDocument, useDocument, useReplaceDocumentFile, formatFileSize, getFileIcon } from '../../domains/documents';
import dayjs from 'dayjs';
import { useLanguage } from '../../shared/contexts/language.context';

const { Option } = Select;
const { Dragger } = Upload;

const DOCUMENT_EDIT_TRANSLATIONS = {
  english: {
    title: "Edit Document",
    save: "Save",
    updateSuccess: "Document updated successfully",
    updateSuccessDesc: "Changes have been saved correctly",
    updateError: "Error updating document",
    loading: "Loading...",
    notFound: "Document not found",
    child: "Child",
    selectChild: "Select a child",
    selectChildRequired: "Please select a child",
    noChildren: "No children available",
    documentType: "Document Type",
    selectDocType: "Select a document type",
    selectDocTypeRequired: "Please select a document type",
    noDocTypes: "No document types available",
    expirationDate: "Expiration Date",
    expirationPlaceholder: "Select expiration date",
    currentFile: "Current File",
    size: "Size",
    replaceFile: "Replace file",
    newFile: "New file (optional)",
    dragText: "Click or drag a file to replace",
    dragHint: "PDF, images, documents, spreadsheets (max 10MB)",
    invalidFileType: "Only PDF, images, documents and spreadsheets are allowed",
    fileTooLarge: "File must be less than 10MB",
  },
  spanish: {
    title: "Editar documento",
    save: "Guardar",
    updateSuccess: "Documento actualizado correctamente",
    updateSuccessDesc: "Los cambios han sido guardados correctamente",
    updateError: "Error al actualizar documento",
    loading: "Cargando...",
    notFound: "Documento no encontrado",
    child: "Niño",
    selectChild: "Selecciona un niño",
    selectChildRequired: "Por favor selecciona un niño",
    noChildren: "No hay niños disponibles",
    documentType: "Tipo de documento",
    selectDocType: "Selecciona un tipo de documento",
    selectDocTypeRequired: "Por favor selecciona un tipo de documento",
    noDocTypes: "No hay tipos de documento disponibles",
    expirationDate: "Fecha de vencimiento",
    expirationPlaceholder: "Selecciona fecha de vencimiento",
    currentFile: "Archivo actual",
    size: "Tamaño",
    replaceFile: "Reemplazar archivo",
    newFile: "Nuevo archivo (opcional)",
    dragText: "Haz clic o arrastra un archivo para reemplazar",
    dragHint: "PDF, imágenes, documentos, hojas de cálculo (máx 10MB)",
    invalidFileType: "Solo se permiten PDF, imágenes, documentos y hojas de cálculo",
    fileTooLarge: "El archivo debe ser menor de 10MB",
  },
} as const;

export const DocumentEdit: React.FC = () => {
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const { language } = useLanguage();
  const t = DOCUMENT_EDIT_TRANSLATIONS[language];

  const { id: idFromUrl } = useParams<{ id: string }>();
  const documentId = idFromUrl != null ? Number(idFromUrl) : undefined;

  const { formProps, saveButtonProps } = useForm({
    resource: 'documents',
    id: documentId,
    onMutationSuccess: async (data) => {
      // Use Refine's useInvalidate for proper cache invalidation (same as children)
      invalidate({
        resource: "documents",
        invalidates: ["list"],
      });

      // Also invalidate the specific document data
      invalidate({
        resource: "documents",
        invalidates: ["detail"],
        id: (data as any).id,
      });

      open?.({
        type: "success",
        message: t.updateSuccess,
        description: t.updateSuccessDesc,
      });

      // Navigate back to documents list
      setTimeout(() => {
        go({
          to: "/documents",
          type: "push",
        });
      }, 1000);
    },
  });

  const updateDocumentMutation = useUpdateDocument();
  const replaceDocumentFileMutation = useReplaceDocumentFile();
  const [fileList, setFileList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get document data using the API hook GET /documents/:id
  const { data: documentResponse, isLoading: documentLoading } = useDocument(documentId ?? 0);
  const documentData = documentResponse?.data ?? documentResponse;

  // Fetch children for the select
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const response = await axiosInstance.get("/children");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch document types for the select
  const { data: documentTypesData, isLoading: documentTypesLoading } = useQuery({
    queryKey: ['document-types'],
    queryFn: async () => {
      const response = await axiosInstance.get("/documents/types");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (documentData && formProps.form) {
      const expiresAtValue = documentData.expiresAt
        ? (typeof documentData.expiresAt === 'string'
            ? documentData.expiresAt
            : dayjs(documentData.expiresAt).toISOString?.() ?? String(documentData.expiresAt))
        : undefined;
      formProps.form.setFieldsValue({
        id: documentData.id,
        childId: documentData.child?.id,
        documentTypeId: documentData.documentType?.id,
        expiresAt: expiresAtValue,
      });
    }
  }, [documentData, formProps.form]);

  const handleFinish = async (values: any) => {
    if (documentId == null) return;
    setIsSubmitting(true);
    try {
      // Validate and format date (form stores string to avoid dayjs serialization issues)
      let expiresAt: string | undefined;
      const rawDate = values.expiresAt;
      if (rawDate) {
        const d = typeof rawDate === 'string' ? dayjs(rawDate) : dayjs.isDayjs(rawDate) ? rawDate : dayjs(rawDate);
        if (d.isValid?.() !== false) {
          expiresAt = d.toISOString();
        }
      }

      const payload = {
        childId: values.childId,
        documentTypeId: values.documentTypeId,
        expiresAt,
      };

      await updateDocumentMutation.mutateAsync({
        id: documentId,
        data: payload,
      });

      // If user selected a new file, replace the document file
      if (fileList.length > 0) {
        const file = fileList[0].originFileObj ?? fileList[0];
        if (file) {
          await replaceDocumentFileMutation.mutateAsync({ id: documentId, file });
        }
      }

      invalidate({ resource: "documents", invalidates: ["list"] });
      invalidate({ resource: "documents", invalidates: ["detail"], id: documentId });
      open?.({
        type: "success",
        message: t.updateSuccess,
        description: t.updateSuccessDesc,
      });
      setTimeout(() => go({ to: "/documents", type: "push" }), 1000);
    } catch (error: any) {
      open?.({
        type: "error",
        message: t.updateError,
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file: any) => {
      const isValidType =
        file.type === 'application/pdf' ||
        file.type.startsWith('image/') ||
        file.type.includes('document') ||
        file.type.includes('spreadsheet');
      if (!isValidType) {
        message.error(t.invalidFileType);
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error(t.fileTooLarge);
        return false;
      }
      setFileList([
        {
          uid: file.uid || String(Date.now()),
          name: file.name,
          status: 'done',
          originFileObj: file,
        },
      ]);
      return false;
    },
    onRemove: () => setFileList([]),
  };

  if (documentId == null) {
    return <div>{t.notFound}</div>;
  }

  if (documentLoading) {
    return <div>{t.loading}</div>;
  }

  if (!documentData) {
    return <div>{t.notFound}</div>;
  }

  return (
    <Edit
      title={t.title}
      saveButtonProps={{
        ...saveButtonProps,
        loading: isSubmitting,
        children: t.save,
        onClick: () => formProps.form?.submit(),
      }}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.child}
              name="childId"
              rules={[{ required: true, message: t.selectChildRequired }]}
            >
              <Select
                placeholder={t.selectChild}
                showSearch
                loading={childrenLoading}
                notFoundContent={childrenLoading ? t.loading : t.noChildren}
                filterOption={(input, option) =>
                  String(option?.children || "").toLowerCase().includes(input.toLowerCase())
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
              label={t.documentType}
              name="documentTypeId"
              rules={[{ required: true, message: t.selectDocTypeRequired }]}
            >
              <Select
                placeholder={t.selectDocType}
                loading={documentTypesLoading}
                notFoundContent={documentTypesLoading ? t.loading : t.noDocTypes}
                showSearch
                filterOption={(input, option) =>
                  String(option?.children || "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {(documentTypesData?.data || []).map((type: any) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={t.expirationDate}
          name="expiresAt"
          getValueProps={(v: string | undefined) => ({ value: v ? dayjs(v) : null })}
          getValueFromEvent={(d: ReturnType<typeof dayjs> | null) => (d && d.isValid?.() ? d.toISOString() : undefined)}
        >
          <DatePicker
            style={{ width: '100%' }}
            format={language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY"}
            placeholder={t.expirationPlaceholder}
          />
        </Form.Item>

        <Form.Item label={t.currentFile}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div
              style={{
                padding: '12px 16px',
                background: '#fafafa',
                borderRadius: '8px',
                border: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span>
                {getFileIcon(documentData.mimeType)} <strong>{documentData.originalFilename}</strong>
                <span style={{ color: '#666', fontSize: '12px', marginLeft: 8 }}>
                  ({documentData.fileSize != null ? formatFileSize(documentData.fileSize) : '—'})
                </span>
              </span>
            </div>
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>{t.newFile}</div>
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">{t.dragText}</p>
                <p className="ant-upload-hint">{t.dragHint}</p>
              </Dragger>
            </div>
          </Space>
        </Form.Item>
      </Form>
    </Edit>
  );
};

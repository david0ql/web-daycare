import React, { useEffect } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, Row, Col, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useGo, useInvalidate, useNotification, useOne } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { useUpdateDocument } from '../../domains/documents';
import dayjs from 'dayjs';
import { useLanguage } from '../../shared/contexts/language.context';

const { Title } = Typography;
const { Option } = Select;

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
  },
} as const;

export const DocumentEdit: React.FC = () => {
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const { language } = useLanguage();
  const t = DOCUMENT_EDIT_TRANSLATIONS[language];

  const { formProps, saveButtonProps } = useForm({
    resource: 'documents',
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
  
  // Get document data using useOne
  const { result: documentData, query: documentQuery } = useOne({
    resource: 'documents',
  }) as any;
  const documentLoading = documentQuery.isLoading;

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
    if (documentData) {
      formProps.form?.setFieldsValue({
        ...documentData,
        childId: documentData.child?.id,
        documentTypeId: documentData.documentType?.id,
        expiresAt: documentData.expiresAt ? dayjs(documentData.expiresAt) : undefined,
      });
    }
  }, [documentData, formProps.form]);

  const handleFinish = async (values: any) => {
    try {
      // Validate and format date using dayjs
      let expiresAt: string | undefined;
      if (values.expiresAt && dayjs(values.expiresAt).isValid()) {
        expiresAt = dayjs(values.expiresAt).toISOString();
      }

      const documentData = {
        ...values,
        expiresAt,
      };

      await updateDocumentMutation.mutateAsync({
        id: documentData.id,
        data: documentData,
      });
    } catch (error: any) {
      open?.({
        type: "error",
        message: t.updateError,
        description: error.response?.data?.message || error.message,
      });
    }
  };

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
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={t.expirationPlaceholder}
          />
        </Form.Item>

        <Form.Item
          label={t.currentFile}
        >
          <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px' }}>
            <strong>{documentData.originalFilename}</strong>
            <br />
            <span style={{ color: '#666', fontSize: '12px' }}>
              {t.size}: {(documentData.fileSize / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </Form.Item>
      </Form>
    </Edit>
  );
};

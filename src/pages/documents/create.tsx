import React, { useState, useMemo } from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, Row, Col, Typography, Button, Upload, message } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGo, useInvalidate, useNotification } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { clearDataProviderCache } from '../../dataProvider-stable-fixed';
import { useCreateDocument, useDocumentTypes, canUploadMultiple } from '../../domains/documents';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useLanguage } from '../../shared/contexts/language.context';

const { Title } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const DOCUMENT_CREATE_TRANSLATIONS = {
  english: {
    title: "Upload Document",
    save: "Save",
    child: "Child",
    childRequired: "Please select a child",
    childPlaceholder: "Select a child",
    loading: "Loading...",
    noChildren: "No children available",
    documentType: "Document Type",
    documentTypeRequired: "Please select a document type",
    documentTypePlaceholder: "Select a document type",
    firstSelectChild: "First select a child",
    noDocumentTypes: "No document types available",
    expirationOptional: "Expiration Date (Optional)",
    expirationPlaceholder: "Select expiration date",
    file: "File",
    fileRequired: "Please select a file",
    dragText: "Click or drag a file to upload",
    dragHint: "Supports PDF files, images, documents and spreadsheets (max 10MB)",
    invalidFileType: "Only PDF files, images, documents and spreadsheets are allowed",
    fileTooLarge: "File must be less than 10MB",
    uploadErrorTitle: "Error uploading document",
    selectFileToUpload: "Please select a file to upload",
    couldNotGetFile: "Could not get the selected file",
    uploadSuccessTitle: "Document uploaded successfully",
    uploadSuccessDesc: "The document has been uploaded correctly",
    seedSuccessTitle: "Document types created successfully",
    seedSuccessDesc: "Basic document types have been created",
    seedErrorTitle: "Error creating document types",
  },
  spanish: {
    title: "Subir documento",
    save: "Guardar",
    child: "Niño",
    childRequired: "Por favor selecciona un niño",
    childPlaceholder: "Selecciona un niño",
    loading: "Cargando...",
    noChildren: "No hay niños disponibles",
    documentType: "Tipo de documento",
    documentTypeRequired: "Por favor selecciona un tipo de documento",
    documentTypePlaceholder: "Selecciona un tipo de documento",
    firstSelectChild: "Primero selecciona un niño",
    noDocumentTypes: "No hay tipos de documento disponibles",
    expirationOptional: "Fecha de vencimiento (Opcional)",
    expirationPlaceholder: "Selecciona fecha de vencimiento",
    file: "Archivo",
    fileRequired: "Por favor selecciona un archivo",
    dragText: "Haz clic o arrastra un archivo para subirlo",
    dragHint: "Soporta archivos PDF, imágenes, documentos y hojas de cálculo (máx 10MB)",
    invalidFileType: "Solo se permiten archivos PDF, imágenes, documentos y hojas de cálculo",
    fileTooLarge: "El archivo debe ser menor de 10MB",
    uploadErrorTitle: "Error al subir documento",
    selectFileToUpload: "Por favor selecciona un archivo para subir",
    couldNotGetFile: "No se pudo obtener el archivo seleccionado",
    uploadSuccessTitle: "Documento subido correctamente",
    uploadSuccessDesc: "El documento ha sido subido correctamente",
    seedSuccessTitle: "Tipos de documento creados correctamente",
    seedSuccessDesc: "Se han creado los tipos de documento básicos",
    seedErrorTitle: "Error al crear tipos de documento",
  },
} as const;

export const DocumentCreate: React.FC = () => {
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const t = DOCUMENT_CREATE_TRANSLATIONS[language];

  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(undefined);
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<number | undefined>(undefined);
  const [fileList, setFileList] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form] = Form.useForm();

  // Fetch children for the select
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const response = await axiosInstance.get('/children');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch document types
  const { data: documentTypesData, isLoading: documentTypesLoading, refetch: refetchDocumentTypes } = useQuery({
    queryKey: ['document-types'],
    queryFn: async () => {
      const response = await axiosInstance.get('/documents/types');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Function to manually seed document types
  const handleSeedDocumentTypes = async () => {
    try {
      await axiosInstance.post('/documents/types/seed');
      await refetchDocumentTypes();
      open?.({
        type: "success",
        message: t.seedSuccessTitle,
        description: t.seedSuccessDesc,
      });
    } catch (error: any) {
      open?.({
        type: "error",
        message: t.seedErrorTitle,
        description: error.response?.data?.message || error.message,
      });
    }
  };

  // Fetch existing documents for the selected child to filter document types
  const { data: existingDocumentsData } = useQuery({
    queryKey: ['documents', 'child', selectedChildId],
    queryFn: async () => {
      if (!selectedChildId) return { data: [] };
      const response = await axiosInstance.get(`/documents/child/${selectedChildId}`);
      return response.data;
    },
    enabled: !!selectedChildId,
    staleTime: 5 * 60 * 1000,
  });

  // Filter document types based on existing documents
  const availableDocumentTypes = useMemo(() => {
    try {
      console.log('🔍 availableDocumentTypes - selectedChildId:', selectedChildId);
      console.log('🔍 availableDocumentTypes - documentTypesData:', documentTypesData);
      console.log('🔍 availableDocumentTypes - existingDocumentsData:', existingDocumentsData);

      // Si no hay niño seleccionado, no mostrar tipos
      if (!selectedChildId) {
        console.log('🔍 No child selected, returning empty array');
        return [];
      }

      // Si no hay tipos de documento cargados, no mostrar nada
      if (!documentTypesData || !documentTypesData.data || !Array.isArray(documentTypesData.data)) {
        console.log('🔍 No document types data or not array, returning empty array');
        return [];
      }

      // Si no hay documentos existentes para este niño, mostrar todos los tipos
      if (!existingDocumentsData?.data || !Array.isArray(existingDocumentsData.data) || existingDocumentsData.data.length === 0) {
        console.log('🔍 No existing documents, returning all types:', documentTypesData.data);
        return documentTypesData.data;
      }

      const existingDocumentTypeIds = existingDocumentsData.data.map((doc: any) => doc.documentTypeId);
      console.log('🔍 Existing document type IDs:', existingDocumentTypeIds);
      
      const availableTypes = documentTypesData.data.filter((type: any) => {
        // Allow 'other' type multiple times
        if (canUploadMultiple(type)) {
          return true;
        }
        // For other types, only allow if not already uploaded
        return !existingDocumentTypeIds.includes(type.id);
      });

      console.log('🔍 Available types after filtering:', availableTypes);

      // Si no hay tipos disponibles (todos ya subidos), solo mostrar 'other'
      if (availableTypes.length === 0) {
        const otherTypes = documentTypesData.data.filter((type: any) => canUploadMultiple(type));
        console.log('🔍 No available types, returning other types:', otherTypes);
        return otherTypes;
      }

      return availableTypes;
    } catch (error) {
      console.error('Error in availableDocumentTypes:', error);
      return [];
    }
  }, [selectedChildId, documentTypesData, existingDocumentsData]);

  const handleFinish = async (values: any) => {
    if (fileList.length === 0) {
      open?.({
        type: "error",
        message: t.uploadErrorTitle,
        description: t.selectFileToUpload,
      });
      return;
    }

    const file = fileList[0].originFileObj || fileList[0];
    if (!file) {
      open?.({
        type: "error",
        message: t.uploadErrorTitle,
        description: t.couldNotGetFile,
      });
      return;
    }

    console.log('🔍 File to upload:', file);
    console.log('🔍 File type:', file.type);
    console.log('🔍 File size:', file.size);

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('childId', values.childId.toString());
      formData.append('documentTypeId', values.documentTypeId.toString());
      
      if (values.expiresAt) {
        formData.append('expiresAt', dayjs(values.expiresAt).toISOString());
      }

      console.log('🔍 FormData entries:');
      formData.forEach((value, key) => {
        console.log(`  ${key}:`, value);
      });

      const response = await axiosInstance.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('🔍 Upload success - response:', response.data);

      // Clear dataProvider cache first
      clearDataProviderCache("documents");

      // Use Refine's useInvalidate for proper cache invalidation
      invalidate({
        resource: "documents",
        invalidates: ["list"],
      });

      // Invalidate the existing documents query for the selected child to refresh available document types
      queryClient.invalidateQueries({
        queryKey: ['documents', 'child', selectedChildId],
      });

      // Also invalidate the main documents list query
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      });

      // Force refetch of documents list
      queryClient.refetchQueries({
        queryKey: ['documents'],
      });
      
      // Show success notification
      open?.({
        type: "success",
        message: t.uploadSuccessTitle,
        description: t.uploadSuccessDesc,
      });
      
      // Navigate back to documents list with a small delay for better UX
      setTimeout(() => {
        go({
          to: "/documents",
          type: "push",
        });
      }, 1000);

    } catch (error: any) {
      console.log('🔍 Upload error:', error);
      open?.({
        type: "error",
        message: t.uploadErrorTitle,
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
      const isValidType = file.type === 'application/pdf' || 
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

      setFileList([{
        uid: file.uid || Date.now().toString(),
        name: file.name,
        status: 'done',
        originFileObj: file,
      }]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  return (
    <Create
      title={t.title}
      saveButtonProps={{
        loading: isSubmitting,
        children: t.save,
        onClick: () => {
          form.submit();
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.child}
              name="childId"
              rules={[{ required: true, message: t.childRequired }]}
            >
              <Select
                placeholder={t.childPlaceholder}
                showSearch
                loading={childrenLoading}
                notFoundContent={childrenLoading ? t.loading : t.noChildren}
                onChange={(value) => {
                  setSelectedChildId(value);
                  setSelectedDocumentTypeId(undefined);
                  // Limpiar el campo del formulario de manera más segura
                  setTimeout(() => {
                    form.setFieldValue('documentTypeId', undefined);
                  }, 0);
                }}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
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
              rules={[{ required: true, message: t.documentTypeRequired }]}
            >
              <Select
                placeholder={t.documentTypePlaceholder}
                loading={documentTypesLoading}
                disabled={!selectedChildId}
                notFoundContent={
                  documentTypesLoading ? t.loading : 
                  !selectedChildId ? t.firstSelectChild :
                  availableDocumentTypes.length === 0 ? t.noDocumentTypes :
                  t.noDocumentTypes
                }
                showSearch
                onChange={(value) => setSelectedDocumentTypeId(value)}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {availableDocumentTypes.map((type: any) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={t.expirationOptional}
          name="expiresAt"
        >
          <DatePicker
            style={{ width: '100%' }}
            format={language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY"}
            placeholder={t.expirationPlaceholder}
          />
        </Form.Item>

        <Form.Item
          label={t.file}
          name="file"
          rules={[{ required: true, message: t.fileRequired }]}
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">{t.dragText}</p>
            <p className="ant-upload-hint">
              {t.dragHint}
            </p>
          </Dragger>
        </Form.Item>
      </Form>
    </Create>
  );
};

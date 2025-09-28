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
import 'dayjs/locale/es';

const { Title } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

export const DocumentCreate: React.FC = () => {
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const queryClient = useQueryClient();

  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(undefined);
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<number | undefined>(undefined);
  const [fileList, setFileList] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form] = Form.useForm();

  // Set dayjs locale
  dayjs.locale('es');

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
        message: "Tipos de documento creados exitosamente",
        description: "Se han creado los tipos de documento básicos",
      });
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error al crear tipos de documento",
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
        message: "Error al subir el documento",
        description: "Por favor seleccione un archivo para subir",
      });
      return;
    }

    const file = fileList[0].originFileObj || fileList[0];
    if (!file) {
      open?.({
        type: "error",
        message: "Error al subir el documento",
        description: "No se pudo obtener el archivo seleccionado",
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
        message: "Documento subido exitosamente",
        description: "El documento ha sido subido correctamente",
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
        message: "Error al subir el documento",
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
        message.error('Solo se permiten archivos PDF, imágenes, documentos y hojas de cálculo');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('El archivo debe ser menor a 10MB');
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
      title="Subir Documento"
      saveButtonProps={{
        loading: isSubmitting,
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
              label="Niño"
              name="childId"
              rules={[{ required: true, message: 'Por favor seleccione un niño' }]}
            >
              <Select
                placeholder="Seleccione un niño"
                showSearch
                loading={childrenLoading}
                notFoundContent={childrenLoading ? "Cargando..." : "No hay niños disponibles"}
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
              label="Tipo de Documento"
              name="documentTypeId"
              rules={[{ required: true, message: 'Por favor seleccione un tipo de documento' }]}
            >
              <Select
                placeholder="Seleccione un tipo de documento"
                loading={documentTypesLoading}
                disabled={!selectedChildId}
                notFoundContent={
                  documentTypesLoading ? "Cargando..." : 
                  !selectedChildId ? "Primero seleccione un niño" :
                  availableDocumentTypes.length === 0 ? "No hay tipos de documento disponibles" :
                  "No hay tipos de documento disponibles"
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
          label="Fecha de Expiración (Opcional)"
          name="expiresAt"
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Seleccione fecha de expiración"
          />
        </Form.Item>

        <Form.Item
          label="Archivo"
          name="file"
          rules={[{ required: true, message: 'Por favor seleccione un archivo' }]}
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Haz clic o arrastra un archivo para subir</p>
            <p className="ant-upload-hint">
              Soporta archivos PDF, imágenes, documentos y hojas de cálculo (máximo 10MB)
            </p>
          </Dragger>
        </Form.Item>
      </Form>
    </Create>
  );
};

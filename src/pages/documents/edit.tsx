import React, { useEffect } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, Row, Col, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useGo, useInvalidate, useNotification, useOne } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { useUpdateDocument } from '../../domains/documents';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

export const DocumentEdit: React.FC = () => {
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();

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
        message: "Document updated successfully",
        description: "Changes have been saved correctly",
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
        message: "Error updating document",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  if (documentLoading) {
    return <div>Loading...</div>;
  }

  if (!documentData) {
    return <div>Document not found</div>;
  }

  return (
    <Edit
      title="Edit Document"
      saveButtonProps={{
        ...saveButtonProps,
        onClick: () => formProps.form?.submit(),
      }}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Child"
              name="childId"
              rules={[{ required: true, message: 'Please select a child' }]}
            >
              <Select
                placeholder="Select a child"
                showSearch
                loading={childrenLoading}
                notFoundContent={childrenLoading ? "Loading..." : "No children available"}
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
              label="Document Type"
              name="documentTypeId"
              rules={[{ required: true, message: 'Please select a document type' }]}
            >
              <Select
                placeholder="Select a document type"
                loading={documentTypesLoading}
                notFoundContent={documentTypesLoading ? "Loading..." : "No document types available"}
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
          label="Expiration Date"
          name="expiresAt"
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Select expiration date"
          />
        </Form.Item>

        <Form.Item
          label="Current File"
        >
          <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px' }}>
            <strong>{documentData.originalFilename}</strong>
            <br />
            <span style={{ color: '#666', fontSize: '12px' }}>
              Size: {(documentData.fileSize / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </Form.Item>
      </Form>
    </Edit>
  );
};

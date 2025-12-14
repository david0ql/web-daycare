import React, { useEffect, useState } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, Row, Col, Typography } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGo, useInvalidate, useNotification } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { useUpdateIncident } from '../../domains/incidents';
import { IncidentAttachmentsMultiple } from './attachments-multiple';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const IncidentsEdit: React.FC = () => {
  const queryClient = useQueryClient();
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  
  const { formProps, saveButtonProps } = useForm({
    resource: 'incidents',
    onMutationSuccess: async (data) => {
      console.log('🔍 onMutationSuccess - data:', data);
      
      // Use Refine's useInvalidate for proper cache invalidation
      await invalidate({
        resource: "incidents",
        invalidates: ["list"],
      });

      // Also invalidate the specific incident data
      await invalidate({
        resource: "incidents",
        invalidates: ["detail"],
        id: (data as any).id,
      });

      // Show success notification
      open?.({
        type: "success",
        message: "Incident updated successfully",
        description: "Changes have been saved correctly",
      });

      // Navigate back to incidents list
      setTimeout(() => {
        go({
          to: "/incidents",
          type: "push",
        });
      }, 1000);
    },
    onMutationError: (error) => {
      console.log('🔍 onMutationError - error:', error);
      open?.({
        type: "error",
        message: "Error updating incident",
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  const updateIncidentMutation = useUpdateIncident();
  const incidentData = formProps.initialValues;
  const [attachments, setAttachments] = useState<any[]>([]);
  
  // Set dayjs locale
  dayjs.locale('es');
  
  // Debug logging
  console.log('🔍 Edit component - formProps:', formProps);
  console.log('🔍 Edit component - incidentData:', incidentData);
  console.log('🔍 Edit component - incidentAttachments:', incidentData?.incidentAttachments);

  // Fetch children for the select
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const response = await axiosInstance.get('/children');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch incident types
  const { data: incidentTypesData, isLoading: incidentTypesLoading } = useQuery({
    queryKey: ['incident-types'],
    queryFn: async () => {
      const response = await axiosInstance.get('/incidents/types');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get attachments from incident data (they come included in the incident response)
  const attachmentsData = incidentData?.incidentAttachments || [];

  useEffect(() => {
    console.log('🔍 useEffect - incidentData:', incidentData);
    console.log('🔍 useEffect - formProps.form:', formProps.form);
    
    if (incidentData) {
      const formValues = {
        childId: incidentData.childId,
        incidentTypeId: incidentData.incidentTypeId,
        title: incidentData.title,
        description: incidentData.description,
        incidentDate: incidentData.incidentDate ? dayjs(incidentData.incidentDate) : undefined,
        location: incidentData.location,
        actionTaken: incidentData.actionTaken,
      };
      
      console.log('🔍 useEffect - setting form values:', formValues);
      formProps.form?.setFieldsValue(formValues);
    }
  }, [incidentData, formProps.form]);

  // Update attachments state when incident data is loaded
  useEffect(() => {
    if (incidentData?.incidentAttachments) {
      console.log('🔍 useEffect - incidentAttachments:', incidentData.incidentAttachments);
      setAttachments(incidentData.incidentAttachments);
    }
  }, [incidentData]);

  const handleFinish = async (values: any) => {
    console.log('🔍 handleFinish - values:', values);
    console.log('🔍 handleFinish - incidentDate:', values.incidentDate);
    console.log('🔍 handleFinish - incidentDate type:', typeof values.incidentDate);
    
    // Validate and format date using dayjs
    let incidentDate: string;
    
    // Check if incidentDate exists and is valid
    if (!values.incidentDate) {
      console.log('🔍 handleFinish - no incidentDate provided');
      open?.({
        type: "error",
        message: "Error updating incident",
        description: "Incident date is required",
      });
      return;
    }
    
    // Try to parse the date
    const parsedDate = dayjs(values.incidentDate);
    if (!parsedDate.isValid()) {
      console.log('🔍 handleFinish - invalid date format:', values.incidentDate);
      open?.({
        type: "error",
        message: "Error updating incident",
        description: "Incident date is not valid",
      });
      return;
    }
    
    incidentDate = parsedDate.toISOString();
    console.log('🔍 handleFinish - formatted incidentDate:', incidentDate);

    const updateData = {
      ...values,
      incidentDate,
    };

    // Let useForm handle the mutation - it will trigger onMutationSuccess
    formProps.onFinish?.(updateData);
  };

  if (saveButtonProps.disabled) {
    return <div>Loading...</div>;
  }

  if (!incidentData) {
    return <div>Incident not found</div>;
  }

  return (
    <Edit
      title="Edit Incident"
      saveButtonProps={saveButtonProps}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={handleFinish}
      >
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
              label="Incident Type"
              name="incidentTypeId"
              rules={[{ required: true, message: 'Please select an incident type' }]}
            >
              <Select
                placeholder="Select an incident type"
                loading={incidentTypesLoading}
                notFoundContent={incidentTypesLoading ? "Loading..." : "No types available"}
              >
                {(incidentTypesData || []).map((type: any) => (
                  <Option key={type.id} value={type.id}>
                    <div>
                      <div>{type.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {type.severityLevel} - {type.description}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Incident Title"
              name="title"
              rules={[{ required: true, message: 'Please enter the incident title' }]}
            >
              <Input placeholder="Incident title" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Incident Description"
              name="description"
              rules={[{ required: true, message: 'Please enter the incident description' }]}
            >
              <TextArea
                rows={4}
                placeholder="Detailed incident description"
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Incident Date and Time"
              name="incidentDate"
              rules={[{ required: true, message: 'Please select the incident date and time' }]}
              getValueFromEvent={(date) => {
                console.log("🔍 DatePicker getValueFromEvent:", date);
                return date;
              }}
              getValueProps={(value) => {
                console.log("🔍 DatePicker getValueProps:", value, typeof value);
                if (!value) return { value: null };
                if (dayjs.isDayjs(value)) return { value };
                if (typeof value === 'string') {
                  const dayjsValue = dayjs(value);
                  return { value: dayjsValue.isValid() ? dayjsValue : null };
                }
                return { value: null };
              }}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Select date and time"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Location"
              name="location"
            >
              <Input placeholder="Location where the incident occurred" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Action Taken"
              name="actionTaken"
            >
              <TextArea
                rows={3}
                placeholder="Action taken in response to the incident (optional)"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* Attachments Section */}
      {incidentData?.id && (
        <div style={{ marginTop: 24 }}>
          <IncidentAttachmentsMultiple
            incidentId={incidentData.id}
            initialAttachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        </div>
      )}
    </Edit>
  );
};
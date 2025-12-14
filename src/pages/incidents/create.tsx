import React, { useState } from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, DatePicker, Row, Col, Typography, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useGo, useInvalidate, useNotification } from '@refinedev/core';
import { axiosInstance } from '../../shared';
import { useCreateIncident } from '../../domains/incidents';
import { IncidentAttachmentsMultiple } from './attachments-multiple';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const IncidentsCreate: React.FC = () => {
  const go = useGo();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  
  const createIncidentMutation = useCreateIncident();
  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();
  const [attachments, setAttachments] = useState<any[]>([]);
  const [createdIncidentId, setCreatedIncidentId] = useState<number | null>(null);

  // Set dayjs locale
  dayjs.locale('es');

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

  const handleFinish = async (values: any) => {
    try {
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
          message: "Error creating incident",
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
          message: "Error creating incident",
          description: "Incident date is not valid",
        });
        return;
      }
      
      incidentDate = parsedDate.toISOString();
      console.log('🔍 handleFinish - formatted incidentDate:', incidentDate);

      const incidentData = {
        ...values,
        incidentDate,
      };

          await createIncidentMutation.mutateAsync(incidentData, {
            onSuccess: async (data) => {
              console.log('🔍 Create success - data:', data);

              // Set the created incident ID to enable attachments
              setCreatedIncidentId((data as any).id);

              // Use Refine's useInvalidate for proper cache invalidation (same as children)
              invalidate({
                resource: "incidents",
                invalidates: ["list"],
              });

              // Also invalidate the specific incident data
              invalidate({
                resource: "incidents",
                invalidates: ["detail"],
                id: (data as any).id,
              });

              open?.({
                type: "success",
                message: "Incident created successfully",
                description: "The incident has been registered correctly. You can now add attachments.",
              });
            },
            onError: (error: any) => {
              open?.({
                type: "error",
                message: "Error creating incident",
                description: error.response?.data?.message || error.message,
              });
            }
          });
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error creating incident",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <Create
      title="Create Incident"
      saveButtonProps={{
        loading: createIncidentMutation.isPending,
        onClick: () => {
          // Submit the form using Antd's form instance
          form.submit();
        },
        style: createdIncidentId ? { display: 'none' } : {},
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          incidentDate: dayjs(),
        }}
        disabled={!!createdIncidentId}
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
                onChange={(value) => setSelectedChildId(value)}
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

      {/* Attachments Section - Only show after incident is created */}
      {createdIncidentId && (
        <div style={{ marginTop: 24 }}>
          <IncidentAttachmentsMultiple
            incidentId={createdIncidentId}
            onAttachmentsChange={setAttachments}
          />
          
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              onClick={() => {
                // Navigate back to incidents list
                go({
                  to: "/incidents",
                  type: "push",
                });
              }}
            >
              Finish and return to list
            </Button>
          </div>
        </div>
      )}
    </Create>
  );
};
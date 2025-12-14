import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useInvalidate, useGo, useNotification } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select, Row, Col, Typography } from "antd";
import { useParams } from "react-router";
import { MOOD_LABELS } from "../../../domains/attendance/types/daily-observations.types";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const AttendanceObservationsEdit: React.FC = () => {
  const { id } = useParams();
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  
  const { formProps, saveButtonProps } = useForm({
    resource: "attendance/daily-observations",
    onMutationSuccess: async (data, variables) => {
      // Force invalidate and refetch all daily-observations-related queries
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "attendance/daily-observations");
        },
      });
      
      // Force refetch all daily-observations queries
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "attendance/daily-observations");
        },
      });
      
      // Show success notification
      open?.({
        type: "success",
        message: "Observation updated successfully",
        description: "Changes have been saved correctly",
      });
      
      // Navigate back to observations list with a small delay for better UX
      setTimeout(() => {
        go({
          to: "/attendance/observations",
          type: "push",
        });
      }, 1000);
    },
    onMutationError: (error, variables) => {
      if (error?.response?.data?.message) {
        const errorMessages = Array.isArray(error.response.data.message) 
          ? error.response.data.message 
          : [error.response.data.message];
        
        errorMessages.forEach((msg: any, index: number) => {
          console.log(`🔍 Error ${index + 1}:`, msg);
        });
      }
      open?.({ 
        type: "error", 
        message: "Error updating observation", 
        description: "Could not update observation. Please check the data and try again." 
      });
    }
  });

  const handleFinish = (values: any) => {
    formProps.onFinish?.(values);
  };

  return (
      <Edit
      title="Edit Daily Observation"
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mood"
              name="mood"
              rules={[{ required: true, message: 'Please select mood' }]}
            >
              <Select placeholder="Select mood">
                {Object.entries(MOOD_LABELS).map(([key, label]) => (
                  <Option key={key} value={key}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="General Observations"
              name="generalObservations"
              rules={[{ required: true, message: 'Please enter observations' }]}
            >
              <TextArea 
                rows={4}
                placeholder="Describe observations about the child"
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
import React from "react";
import { useList, useInvalidate, useGo, useNotification } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select, Switch, Button } from "antd";

// Custom Switch component that always returns boolean
const BooleanSwitch: React.FC<{ value?: boolean; onChange?: (value: boolean) => void }> = ({ value, onChange }) => {
  const handleChange = (checked: boolean) => {
    console.log("🔍 BooleanSwitch onChange:", checked, typeof checked);
    onChange?.(checked);
  };

  return <Switch checked={Boolean(value)} onChange={handleChange} />;
};

interface UserRole {
  id: number;
  name: string;
  description: string | null;
}

export const UserEdit: React.FC = () => {
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  
  const { formProps, saveButtonProps } = useForm({
    onMutationSuccess: async (data, variables) => {
      console.log("🔍 Mutation success - data:", data);
      console.log("🔍 Mutation success - variables:", variables);
      console.log("🔍 Mutation success - roleId sent:", (variables as any).roleId);
      console.log("🔍 Mutation success - roleId received:", (data as any).roleId);
      
      // Force invalidate and refetch all users-related queries
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "users");
        },
      });
      
      // Force refetch all users queries
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "users");
        },
      });
      
      // Show success notification
      open?.({
        type: "success",
        message: "User updated successfully",
        description: "Changes have been saved correctly",
      });
      
      // Navigate back to users list with a small delay for better UX
      setTimeout(() => {
        go({
          to: "/users",
          type: "push",
        });
      }, 1000);
    },
    onMutationError: (error, variables) => {
      console.log("🔍 Mutation error:", error);
      console.log("🔍 Mutation error - variables:", variables);
    }
  });

  // Fetch user roles for the select
  const rolesQuery = useList<UserRole>({
    resource: "roles",
  });

  const roles = rolesQuery.result?.data || [];

  // Debug logs
  console.log("🔍 UserEdit - rolesQuery:", rolesQuery);
  console.log("🔍 UserEdit - roles:", roles);

  // Custom onFinish to transform data
  const handleFinish = (values: any) => {
    console.log("🔍 Form onFinish - original values:", values);
    console.log("🔍 Form onFinish - roleId type:", typeof values.roleId, "value:", values.roleId);
    
    const transformedValues = {
      ...values,
      isActive: Boolean(values.isActive),
      // Ensure roleId is a number
      roleId: Number(values.roleId)
    };
    console.log("🔍 Form onFinish - transformed values:", transformedValues);
    console.log("🔍 Form onFinish - transformed roleId type:", typeof transformedValues.roleId, "value:", transformedValues.roleId);
    
    // Call the original formProps.onFinish with transformed values
    if (formProps.onFinish) {
      formProps.onFinish(transformedValues);
    }
  };

  return (
    <Edit title="Edit User" saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="usuario@ejemplo.com" />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="password"
          rules={[
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password placeholder="Leave empty to keep current password" />
        </Form.Item>

        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "First name is required" }]}
        >
          <Input placeholder="First name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Last name is required" }]}
        >
          <Input placeholder="Last name" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
        >
          <Input placeholder="+1234567890" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="roleId"
          rules={[{ required: true, message: "Role is required" }]}
        >
          <Select
            placeholder="Select a role"
            options={roles.map((role: UserRole) => ({
              label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
              value: role.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Active Status"
          name="isActive"
        >
          <BooleanSwitch />
        </Form.Item>

        <Form.Item
          label="Profile Picture"
          name="profilePicture"
        >
          <Input placeholder="Image URL (optional)" />
        </Form.Item>
      </Form>
    </Edit>
  );
};

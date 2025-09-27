import React from "react";
import { useList, useInvalidate, useGo, useNotification } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select, Switch, Upload, Button, Avatar } from "antd";

// Custom Switch component that always returns boolean
const BooleanSwitch: React.FC<{ value?: boolean; onChange?: (value: boolean) => void }> = ({ value, onChange }) => {
  const handleChange = (checked: boolean) => {
    console.log("🔍 BooleanSwitch onChange:", checked, typeof checked);
    onChange?.(checked);
  };

  return <Switch checked={Boolean(value)} onChange={handleChange} />;
};
import { UserOutlined, UploadOutlined } from "@ant-design/icons";

interface UserRole {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export const UserCreate: React.FC = () => {
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  
  const { formProps, saveButtonProps } = useForm({
    onMutationSuccess: async (data, variables) => {
      console.log("🔍 CREATE Mutation success - data:", data);
      console.log("🔍 CREATE Mutation success - variables:", variables);
      
      // Use Refine's useInvalidate for proper cache invalidation
      invalidate({
        resource: "users",
        invalidates: ["list"],
      });
      
      // Also invalidate the specific user data
      invalidate({
        resource: "users",
        invalidates: ["detail"],
        id: (data as any).id,
      });
      
      // Show success notification
      open?.({
        type: "success",
        message: "Usuario creado exitosamente",
        description: "El nuevo usuario ha sido registrado correctamente",
      });
      
      // Navigate back to users list with a small delay for better UX
      setTimeout(() => {
        go({
          to: "/users",
          type: "push",
        });
      }, 1000);
    }
  });

  // Fetch user roles for the select
  const rolesQuery = useList<UserRole>({
    resource: "roles",
  });

  const roles = rolesQuery.result?.data || [];

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
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "El email es requerido" },
            { type: "email", message: "Ingrese un email válido" },
          ]}
        >
          <Input placeholder="usuario@ejemplo.com" />
        </Form.Item>

        <Form.Item
          label="Contraseña"
          name="password"
          rules={[
            { required: true, message: "La contraseña es requerida" },
            { min: 6, message: "La contraseña debe tener al menos 6 caracteres" },
          ]}
        >
          <Input.Password placeholder="Ingrese la contraseña" />
        </Form.Item>

        <Form.Item
          label="Nombre"
          name="firstName"
          rules={[{ required: true, message: "El nombre es requerido" }]}
        >
          <Input placeholder="Nombre" />
        </Form.Item>

        <Form.Item
          label="Apellido"
          name="lastName"
          rules={[{ required: true, message: "El apellido es requerido" }]}
        >
          <Input placeholder="Apellido" />
        </Form.Item>

        <Form.Item
          label="Teléfono"
          name="phone"
        >
          <Input placeholder="+1234567890" />
        </Form.Item>

        <Form.Item
          label="Rol"
          name="roleId"
          rules={[{ required: true, message: "El rol es requerido" }]}
        >
          <Select
            placeholder="Seleccione un rol"
            options={roles.map((role: UserRole) => ({
              label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
              value: role.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Estado Activo"
          name="isActive"
          initialValue={true}
        >
          <BooleanSwitch />
        </Form.Item>

        <Form.Item
          label="Foto de Perfil"
          name="profilePicture"
        >
          <Input placeholder="URL de la imagen (opcional)" />
        </Form.Item>
      </Form>
    </Create>
  );
};

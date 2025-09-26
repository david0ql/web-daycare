import React from "react";
import { useList } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Switch, Button } from "antd";

interface UserRole {
  id: number;
  name: string;
  description: string | null;
}

export const UserEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();

  // Fetch user roles for the select
  const { data: rolesData } = useList<UserRole>({
    resource: "roles",
  });

  const roles = rolesData?.data || [];
  const userData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
          label="Nueva Contraseña"
          name="password"
          rules={[
            { min: 6, message: "La contraseña debe tener al menos 6 caracteres" },
          ]}
        >
          <Input.Password placeholder="Dejar vacío para mantener la actual" />
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
            options={roles.map((role) => ({
              label: role.description || role.name,
              value: role.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Estado Activo"
          name="isActive"
          valuePropName="checked"
          getValueFromEvent={(checked) => Boolean(checked)}
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Foto de Perfil"
          name="profilePicture"
        >
          <Input placeholder="URL de la imagen (opcional)" />
        </Form.Item>
      </Form>
    </Edit>
  );
};

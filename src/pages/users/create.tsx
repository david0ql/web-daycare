import React from "react";
import { useList } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, Switch, Upload, Button, Avatar } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";

interface UserRole {
  id: number;
  name: string;
  displayName: string;
}

export const UserCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  // Fetch user roles for the select
  const { data: rolesData } = useList<UserRole>({
    resource: "user-roles",
  });

  const roles = rolesData?.data || [];

  return (
    <Create saveButtonProps={saveButtonProps}>
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
            options={roles.map((role) => ({
              label: role.displayName,
              value: role.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Estado Activo"
          name="isActive"
          valuePropName="checked"
          initialValue={true}
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
    </Create>
  );
};

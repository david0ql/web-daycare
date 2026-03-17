import React, { useState } from "react";
import { useList, useInvalidate, useGo, useNotification } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select, Switch, Upload, Button, Avatar } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useLanguage } from "../../shared/contexts/language.context";
import axiosInstance from "../../shared/config/axios.config";

const USER_CREATE_TRANSLATIONS = {
  english: {
    title: "Create User",
    email: "Email",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email",
    emailPlaceholder: "usuario@ejemplo.com",
    password: "Password",
    passwordRequired: "Password is required",
    passwordMin: "Password must be at least 6 characters",
    passwordPlaceholder: "Enter password",
    firstName: "First Name",
    firstNameRequired: "First name is required",
    firstNamePlaceholder: "First name",
    lastName: "Last Name",
    lastNameRequired: "Last name is required",
    lastNamePlaceholder: "Last name",
    phone: "Phone",
    phonePlaceholder: "+1234567890",
    role: "Role",
    roleRequired: "Role is required",
    rolePlaceholder: "Select a role",
    activeStatus: "Active Status",
    profilePicture: "Profile Picture",
    selectPhoto: "Select Photo",
    successMessage: "User created successfully",
    successDescription: "The new user has been registered correctly",
    save: "Save",
    roleAdministrator: "Administrator",
    roleEducator: "Educator",
    roleParent: "Parent",
    roleStaff: "Staff",
  },
  spanish: {
    title: "Crear usuario",
    email: "Correo electrónico",
    emailRequired: "El correo es requerido",
    emailInvalid: "Por favor ingresa un correo válido",
    emailPlaceholder: "usuario@ejemplo.com",
    password: "Contraseña",
    passwordRequired: "La contraseña es requerida",
    passwordMin: "La contraseña debe tener al menos 6 caracteres",
    passwordPlaceholder: "Ingresa la contraseña",
    firstName: "Nombre",
    firstNameRequired: "El nombre es requerido",
    firstNamePlaceholder: "Nombre",
    lastName: "Apellido",
    lastNameRequired: "El apellido es requerido",
    lastNamePlaceholder: "Apellido",
    phone: "Teléfono",
    phonePlaceholder: "+1234567890",
    role: "Rol",
    roleRequired: "El rol es requerido",
    rolePlaceholder: "Seleccionar un rol",
    activeStatus: "Estado activo",
    profilePicture: "Foto de perfil",
    selectPhoto: "Seleccionar foto",
    successMessage: "Usuario creado correctamente",
    successDescription: "El nuevo usuario ha sido registrado correctamente",
    save: "Guardar",
    roleAdministrator: "Administrador",
    roleEducator: "Educador",
    roleParent: "Padre/Madre",
    roleStaff: "Personal",
  },
} as const;

// Custom Switch component that always returns boolean
const BooleanSwitch: React.FC<{ value?: boolean; onChange?: (value: boolean) => void }> = ({ value, onChange }) => {
  const handleChange = (checked: boolean) => {
    onChange?.(checked);
  };

  return <Switch checked={Boolean(value)} onChange={handleChange} />;
};

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
  const { language } = useLanguage();
  const t = USER_CREATE_TRANSLATIONS[language];
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const getRoleDisplayName = (roleName: string) => {
    const map: Record<string, string> = {
      administrator: t.roleAdministrator,
      educator: t.roleEducator,
      parent: t.roleParent,
      staff: t.roleStaff,
    };
    return map[roleName] || roleName.charAt(0).toUpperCase() + roleName.slice(1);
  };
  
  const { formProps, saveButtonProps } = useForm({
    onMutationSuccess: async (data, variables) => {
      const newUserId = (data as any).id;

      // Upload profile photo if a file was selected
      if (profileFile && newUserId) {
        try {
          const formData = new FormData();
          formData.append('file', profileFile);
          await axiosInstance.post(`/users/${newUserId}/profile-photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch {
          // Photo upload failure is non-blocking
        }
      }

      // Use Refine's useInvalidate for proper cache invalidation
      invalidate({
        resource: "users",
        invalidates: ["list"],
      });

      // Also invalidate the specific user data
      invalidate({
        resource: "users",
        invalidates: ["detail"],
        id: newUserId,
      });

      // Show success notification
      open?.({
        type: "success",
        message: t.successMessage,
        description: t.successDescription,
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
    
    const transformedValues = {
      ...values,
      isActive: Boolean(values.isActive),
      // Ensure roleId is a number
      roleId: Number(values.roleId)
    };
    
    // Call the original formProps.onFinish with transformed values
    if (formProps.onFinish) {
      formProps.onFinish(transformedValues);
    }
  };

  return (
    <Create title={t.title} saveButtonProps={{ ...saveButtonProps, children: t.save }}>
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label={t.email}
          name="email"
          rules={[
            { required: true, message: t.emailRequired },
            { type: "email", message: t.emailInvalid },
          ]}
        >
          <Input placeholder={t.emailPlaceholder} />
        </Form.Item>

        <Form.Item
          label={t.password}
          name="password"
          rules={[
            { required: true, message: t.passwordRequired },
            { min: 6, message: t.passwordMin },
          ]}
        >
          <Input.Password placeholder={t.passwordPlaceholder} />
        </Form.Item>

        <Form.Item
          label={t.firstName}
          name="firstName"
          rules={[{ required: true, message: t.firstNameRequired }]}
        >
          <Input placeholder={t.firstNamePlaceholder} />
        </Form.Item>

        <Form.Item
          label={t.lastName}
          name="lastName"
          rules={[{ required: true, message: t.lastNameRequired }]}
        >
          <Input placeholder={t.lastNamePlaceholder} />
        </Form.Item>

        <Form.Item
          label={t.phone}
          name="phone"
        >
          <Input placeholder={t.phonePlaceholder} />
        </Form.Item>

        <Form.Item
          label={t.role}
          name="roleId"
          rules={[{ required: true, message: t.roleRequired }]}
        >
          <Select
            placeholder={t.rolePlaceholder}
            options={roles.map((role: UserRole) => ({
              label: getRoleDisplayName(role.name),
              value: role.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label={t.activeStatus}
          name="isActive"
          initialValue={true}
        >
          <BooleanSwitch />
        </Form.Item>

        <Form.Item label={t.profilePicture}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar
              size={64}
              src={profilePreview}
              icon={<UserOutlined />}
            />
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                setProfileFile(file);
                const reader = new FileReader();
                reader.onload = (e) => setProfilePreview(e.target?.result as string);
                reader.readAsDataURL(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>{t.selectPhoto}</Button>
            </Upload>
          </div>
        </Form.Item>
      </Form>
    </Create>
  );
};

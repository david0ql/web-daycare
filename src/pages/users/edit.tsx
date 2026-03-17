import React, { useState, useEffect } from "react";
import { useList, useInvalidate, useGo, useNotification } from "@refinedev/core";
import { Edit, useForm, ListButton, RefreshButton } from "@refinedev/antd";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select, Switch, Upload, Button, Avatar } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useLanguage } from "../../shared/contexts/language.context";
import axiosInstance from "../../shared/config/axios.config";

const USER_EDIT_TRANSLATIONS = {
  english: {
    title: "Edit User",
    email: "Email",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email",
    emailPlaceholder: "usuario@ejemplo.com",
    newPassword: "New Password",
    passwordMin: "Password must be at least 6 characters",
    passwordPlaceholder: "Leave empty to keep current password",
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
    successMessage: "User updated successfully",
    successDescription: "Changes have been saved correctly",
    save: "Save",
    users: "Users",
    refresh: "Refresh",
    roleAdministrator: "Administrator",
    roleEducator: "Educator",
    roleParent: "Parent",
    roleStaff: "Staff",
  },
  spanish: {
    title: "Editar usuario",
    email: "Correo electrónico",
    emailRequired: "El correo es requerido",
    emailInvalid: "Por favor ingresa un correo válido",
    emailPlaceholder: "usuario@ejemplo.com",
    newPassword: "Nueva contraseña",
    passwordMin: "La contraseña debe tener al menos 6 caracteres",
    passwordPlaceholder: "Dejar vacío para mantener la contraseña actual",
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
    successMessage: "Usuario actualizado correctamente",
    successDescription: "Los cambios han sido guardados correctamente",
    save: "Guardar",
    users: "Usuarios",
    refresh: "Actualizar",
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
  description: string | null;
}

export const UserEdit: React.FC = () => {
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const { language } = useLanguage();
  const t = USER_EDIT_TRANSLATIONS[language];
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
  
  const { formProps, saveButtonProps, id } = useForm({
    onMutationSuccess: async (data, variables) => {
      
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
    },
    onMutationError: (error, variables) => {
    }
  });

  // Fetch user roles for the select
  const rolesQuery = useList<UserRole>({
    resource: "roles",
  });

  const roles = rolesQuery.result?.data || [];

  // Sync preview with current profilePicture value from form
  useEffect(() => {
    const currentPicture = formProps.initialValues?.profilePicture;
    if (currentPicture && !profilePreview) {
      const previewUrl = currentPicture.startsWith('http')
        ? currentPicture
        : `https://api.thechildrenworld.com/api${currentPicture}`;
      setProfilePreview(previewUrl);
    }
  }, [formProps.initialValues]);

  const handleProfileUpload = async (file: File) => {
    if (!id) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axiosInstance.post(`/users/${id}/profile-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newPath = response.data?.profilePicture;
      if (newPath) {
        formProps.form?.setFieldValue('profilePicture', newPath);
        const previewUrl = newPath.startsWith('http')
          ? newPath
          : `https://api.thechildrenworld.com/api${newPath}`;
        setProfilePreview(previewUrl);
      }
    } catch {
      // Error handled by axios interceptor
    }
  };

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
    <Edit
      title={t.title}
      saveButtonProps={{ ...saveButtonProps, children: t.save }}
      headerButtons={({ listButtonProps, refreshButtonProps }) => (
        <>
          {listButtonProps && <ListButton {...listButtonProps}>{t.users}</ListButton>}
          <RefreshButton {...refreshButtonProps}>{t.refresh}</RefreshButton>
        </>
      )}
    >
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
          label={t.newPassword}
          name="password"
          rules={[
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
        >
          <BooleanSwitch />
        </Form.Item>

        <Form.Item label={t.profilePicture} name="profilePicture" hidden>
          <Input />
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
                const reader = new FileReader();
                reader.onload = (e) => setProfilePreview(e.target?.result as string);
                reader.readAsDataURL(file);
                handleProfileUpload(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>{t.selectPhoto}</Button>
            </Upload>
          </div>
        </Form.Item>
      </Form>
    </Edit>
  );
};

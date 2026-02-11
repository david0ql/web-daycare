import React from "react";
import { useList, useInvalidate, useGo, useNotification } from "@refinedev/core";
import { Edit, useForm, ListButton, RefreshButton } from "@refinedev/antd";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select, Switch } from "antd";
import { useLanguage } from "../../shared/contexts/language.context";

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
    profilePicturePlaceholder: "Image URL (optional)",
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
    profilePicturePlaceholder: "URL de imagen (opcional)",
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
  const { language } = useLanguage();
  const t = USER_EDIT_TRANSLATIONS[language];

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

        <Form.Item
          label={t.profilePicture}
          name="profilePicture"
        >
          <Input placeholder={t.profilePicturePlaceholder} />
        </Form.Item>
      </Form>
    </Edit>
  );
};

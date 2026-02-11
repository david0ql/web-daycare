import React from "react";
import { List, useTable, EditButton, DeleteButton, CreateButton } from "@refinedev/antd";
import { Table, Space, Tag, Avatar, Typography } from "antd";
import { UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { User } from "../types/user.types";
import { UserUtils } from "../utils/user.utils";
import { useAuth } from "../../../shared/hooks/use-auth.hook";
import { useLanguage } from "../../../shared/contexts/language.context";

const { Text } = Typography;

const USER_LIST_TRANSLATIONS = {
  english: {
    userList: "User List",
    newUser: "New User",
    avatar: "Avatar",
    name: "Name",
    role: "Role",
    phone: "Phone",
    status: "Status",
    lastAccess: "Last Access",
    registrationDate: "Registration Date",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    notSpecified: "Not specified",
    never: "Never",
    lessThan1HourAgo: "Less than 1 hour ago",
    hoursAgo: "hours ago",
    daysAgo: "days ago",
    roleAdministrator: "Administrator",
    roleEducator: "Educator",
    roleParent: "Parent",
    roleStaff: "Staff",
    noData: "No data",
  },
  spanish: {
    userList: "Lista de usuarios",
    newUser: "Nuevo usuario",
    avatar: "Avatar",
    name: "Nombre",
    role: "Rol",
    phone: "Teléfono",
    status: "Estado",
    lastAccess: "Último acceso",
    registrationDate: "Fecha de registro",
    actions: "Acciones",
    active: "Activo",
    inactive: "Inactivo",
    notSpecified: "No especificado",
    never: "Nunca",
    lessThan1HourAgo: "Hace menos de 1 hora",
    hoursAgo: "horas",
    daysAgo: "días",
    roleAdministrator: "Administrador",
    roleEducator: "Educador",
    roleParent: "Padre/Madre",
    roleStaff: "Personal",
    noData: "Sin datos",
  },
} as const;

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const t = USER_LIST_TRANSLATIONS[language];

  const getRoleDisplayName = (roleName: string) => {
    const map: Record<string, string> = {
      administrator: t.roleAdministrator,
      educator: t.roleEducator,
      parent: t.roleParent,
      staff: t.roleStaff,
    };
    return map[roleName] || roleName;
  };

  const getLastLoginDisplay = (lastLogin?: string) => {
    if (!lastLogin) return t.never;
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return t.lessThan1HourAgo;
    if (diffInHours < 24) return `${diffInHours} ${t.hoursAgo}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ${t.daysAgo}`;
    return date.toLocaleDateString(language === "spanish" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return t.notSpecified;
    return phone;
  };

  const { tableProps } = useTable<User>({
    syncWithLocation: false, // Desactivar sincronización con URL para evitar problemas
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
  });

  return (
    <List
      title={t.userList}
      headerButtons={
        isAdmin() ? (
          <CreateButton
            icon={<UserAddOutlined />}
            onClick={() => navigate("/users/create")}
          >
            {t.newUser}
          </CreateButton>
        ) : undefined
      }
    >
      <Table {...tableProps} rowKey="id" locale={{ emptyText: t.noData }}>
        <Table.Column
          dataIndex="profilePicture"
          title={t.avatar}
          render={(_, record: User) => (
            <Avatar
              size={40}
              src={record.profilePicture}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            >
              {UserUtils.getInitials(record)}
            </Avatar>
          )}
        />
        <Table.Column
          dataIndex="firstName"
          title={t.name}
          render={(_, record: User) => (
            <div>
              <Text strong>{UserUtils.getFullName(record)}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.email}
              </Text>
            </div>
          )}
        />
        <Table.Column
          dataIndex="role"
          title={t.role}
          render={(role) => (
            <Tag color={UserUtils.getRoleColor(role.name)}>
              {getRoleDisplayName(role.name)}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="phone"
          title={t.phone}
          render={(phone) => (
            <Text>{formatPhone(phone)}</Text>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title={t.status}
          render={(isActive) => (
            <Tag color={isActive ? "green" : "red"}>
              {isActive ? t.active : t.inactive}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="lastLogin"
          title={t.lastAccess}
          render={(lastLogin) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {getLastLoginDisplay(lastLogin)}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title={t.registrationDate}
          render={(date) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {new Date(date).toLocaleDateString(language === "spanish" ? "es-ES" : "en-US")}
            </Text>
          )}
        />
        <Table.Column
          title={t.actions}
          dataIndex="actions"
          render={(_, record: User) => (
            <Space>
              {isAdmin() && (
                <>
                  <EditButton hideText size="small" recordItemId={record.id} />
                  <DeleteButton hideText size="small" recordItemId={record.id} />
                </>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

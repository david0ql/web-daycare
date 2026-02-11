import React from "react";
import { List, useTable, EditButton, DeleteButton, TagField } from "@refinedev/antd";
import { Table, Space, Tag, Avatar, Typography, Button } from "antd";
import { UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useAuth } from "../../shared/hooks/use-auth.hook";
import { useLanguage } from "../../shared/contexts/language.context";
import { getIntlLocale } from "../../shared/i18n/locale";

const { Text } = Typography;

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

const USERS_LIST_TRANSLATIONS = {
  english: {
    title: "User List",
    registerUser: "Register User",
    avatar: "Avatar",
    fullName: "Full Name",
    phone: "Phone",
    role: "Role",
    status: "Status",
    lastAccess: "Last Access",
    actions: "Actions",
    notSpecified: "Not specified",
    active: "Active",
    inactive: "Inactive",
    never: "Never",
  },
  spanish: {
    title: "Lista de usuarios",
    registerUser: "Registrar usuario",
    avatar: "Avatar",
    fullName: "Nombre completo",
    phone: "Teléfono",
    role: "Rol",
    status: "Estado",
    lastAccess: "Último acceso",
    actions: "Acciones",
    notSpecified: "No especificado",
    active: "Activo",
    inactive: "Inactivo",
    never: "Nunca",
  },
} as const;

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const t = USERS_LIST_TRANSLATIONS[language];
  const intlLocale = getIntlLocale(language);

  const { tableProps } = useTable<User>({
    syncWithLocation: false,
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
  });

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "administrator":
        return "red";
      case "educator":
        return "blue";
      case "parent":
        return "green";
      default:
        return "default";
    }
  };

  return (
    <List
      title={t.title}
      headerButtons={
        isAdmin() ? (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => navigate("/users/register")}
          >
            {t.registerUser}
          </Button>
        ) : undefined
      }
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="profilePicture"
          title={t.avatar}
          render={(value, record: User) => (
            <Avatar
              src={value}
              icon={<UserOutlined />}
              alt={`${record.firstName} ${record.lastName}`}
            />
          )}
          width="80px"
        />
        <Table.Column
          dataIndex="firstName"
          title={t.fullName}
          render={(value, record: User) => (
            <Space direction="vertical" size={0}>
              <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
              <Text type="secondary">{record.email}</Text>
            </Space>
          )}
        />
        <Table.Column
          dataIndex="phone"
          title={t.phone}
          render={(value) => value || t.notSpecified}
        />
        <Table.Column
          dataIndex={["role", "description"]}
          title={t.role}
          render={(value, record: User) => (
            <Tag color={getRoleColor(record.role.name)}>
              {record.role.description || record.role.name}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title={t.status}
          render={(value) => (
            <TagField
              value={value ? t.active : t.inactive}
              color={value ? "green" : "red"}
            />
          )}
        />
        <Table.Column
          dataIndex="lastLogin"
          title={t.lastAccess}
          render={(value) => {
            if (!value) return t.never;
            return new Date(value).toLocaleString(intlLocale, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }}
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

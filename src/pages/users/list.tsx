import React from "react";
import { useList, usePermissions } from "@refinedev/core";
import { List, useTable, EditButton, DeleteButton, TagField, CreateButton } from "@refinedev/antd";
import { Table, Space, Tag, Avatar, Typography, Button } from "antd";
import { UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useAuth } from "../../shared/hooks/use-auth.hook";

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

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { data: permissions } = usePermissions({});
  const { isAdmin } = useAuth();
  
  console.log("🔍 UserList - permissions:", permissions);
  console.log("🔍 UserList - isAdmin():", isAdmin());

  const { tableProps } = useTable<User>({
    syncWithLocation: true,
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
      headerButtons={
        isAdmin() ? (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => navigate("/users/register")}
          >
            Registrar Usuario
          </Button>
        ) : undefined
      }
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="profilePicture"
          title="Avatar"
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
          title="Nombre Completo"
          render={(value, record: User) => (
            <Space direction="vertical" size={0}>
              <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
              <Text type="secondary">{record.email}</Text>
            </Space>
          )}
        />
        <Table.Column
          dataIndex="phone"
          title="Teléfono"
          render={(value) => value || "No especificado"}
        />
        <Table.Column
          dataIndex={["role", "description"]}
          title="Rol"
          render={(value, record: User) => (
            <Tag color={getRoleColor(record.role.name)}>
              {record.role.description || record.role.name}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title="Estado"
          render={(value) => (
            <TagField
              value={value ? "Activo" : "Inactivo"}
              color={value ? "green" : "red"}
            />
          )}
        />
        <Table.Column
          dataIndex="lastLogin"
          title="Último Acceso"
          render={(value) => {
            if (!value) return "Nunca";
            return new Date(value).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }}
        />
        <Table.Column
          title="Acciones"
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

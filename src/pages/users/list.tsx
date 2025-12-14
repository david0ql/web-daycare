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
      title="User List"
      headerButtons={
        isAdmin() ? (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => navigate("/users/register")}
          >
            Register User
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
          title="Full Name"
          render={(value, record: User) => (
            <Space direction="vertical" size={0}>
              <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
              <Text type="secondary">{record.email}</Text>
            </Space>
          )}
        />
        <Table.Column
          dataIndex="phone"
          title="Phone"
          render={(value) => value || "Not specified"}
        />
        <Table.Column
          dataIndex={["role", "description"]}
          title="Role"
          render={(value, record: User) => (
            <Tag color={getRoleColor(record.role.name)}>
              {record.role.description || record.role.name}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title="Status"
          render={(value) => (
            <TagField
              value={value ? "Active" : "Inactive"}
              color={value ? "green" : "red"}
            />
          )}
        />
        <Table.Column
          dataIndex="lastLogin"
          title="Last Access"
          render={(value) => {
            if (!value) return "Never";
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
          title="Actions"
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

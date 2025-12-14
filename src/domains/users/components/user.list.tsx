import React from "react";
import { useList, usePermissions } from "@refinedev/core";
import { List, useTable, EditButton, DeleteButton, TagField, CreateButton } from "@refinedev/antd";
import { Table, Space, Tag, Avatar, Typography, Button } from "antd";
import { UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { User } from "../types/user.types";
import { UserUtils } from "../utils/user.utils";
import { useAuth } from "../../../shared/hooks/use-auth.hook";

const { Text } = Typography;

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

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
      headerButtons={
        isAdmin() ? (
          <CreateButton
            icon={<UserAddOutlined />}
            onClick={() => navigate("/users/create")}
          >
            New User
          </CreateButton>
        ) : undefined
      }
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="profilePicture"
          title="Avatar"
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
          title="Name"
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
          title="Role"
          render={(role) => (
            <Tag color={UserUtils.getRoleColor(role.name)}>
              {UserUtils.getRoleDisplayName(role.name)}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="phone"
          title="Phone"
          render={(phone) => (
            <Text>{UserUtils.formatPhoneNumber(phone)}</Text>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title="Status"
          render={(isActive) => (
            <Tag color={isActive ? "green" : "red"}>
              {isActive ? "Active" : "Inactive"}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="lastLogin"
          title="Last Access"
          render={(lastLogin) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {UserUtils.getLastLoginDisplay(lastLogin)}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Registration Date"
          render={(date) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {new Date(date).toLocaleDateString()}
            </Text>
          )}
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

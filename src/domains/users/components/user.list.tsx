import React from "react";
import { useList, usePermissions } from "@refinedev/core";
import { List, useTable, ShowButton, EditButton, DeleteButton, TagField, CreateButton } from "@refinedev/antd";
import { Table, Space, Tag, Avatar, Typography, Button } from "antd";
import { UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { User } from "../types/user.types";
import { UserUtils } from "../utils/user.utils";

const { Text } = Typography;

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { data: permissions } = usePermissions({});
  const isAdmin = permissions === "administrator";

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

  return (
    <List
      headerButtons={
        isAdmin ? (
          <CreateButton
            icon={<UserAddOutlined />}
            onClick={() => navigate("/users/create")}
          >
            Nuevo Usuario
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
          title="Nombre"
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
          title="Rol"
          render={(role) => (
            <Tag color={UserUtils.getRoleColor(role.name)}>
              {UserUtils.getRoleDisplayName(role.name)}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="phone"
          title="Teléfono"
          render={(phone) => (
            <Text>{UserUtils.formatPhoneNumber(phone)}</Text>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title="Estado"
          render={(isActive) => (
            <Tag color={isActive ? "green" : "red"}>
              {isActive ? "Activo" : "Inactivo"}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="lastLogin"
          title="Último Acceso"
          render={(lastLogin) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {UserUtils.getLastLoginDisplay(lastLogin)}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Fecha de Registro"
          render={(date) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {new Date(date).toLocaleDateString()}
            </Text>
          )}
        />
        <Table.Column
          title="Acciones"
          dataIndex="actions"
          render={(_, record: User) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              {isAdmin && (
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

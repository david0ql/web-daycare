import React from "react";
import { List, useTable, EditButton, DeleteButton, TagField, CreateButton } from "@refinedev/antd";
import { Table, Space, Tag, Avatar, Typography, Button } from "antd";
import { UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { Child } from "../types/child.types";
import { ChildUtils } from "../utils/child.utils";
import { useAuth } from "../../../shared/hooks/use-auth.hook";

const { Text } = Typography;

export const ChildList: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isEducator } = useAuth();

  const { tableProps } = useTable<Child>({
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

  const canManage = isAdmin() || isEducator();

  return (
    <List
      headerButtons={
        canManage ? (
          <CreateButton
            icon={<UserAddOutlined />}
            onClick={() => navigate("/children/create")}
          >
            Nuevo Niño
          </CreateButton>
        ) : undefined
      }
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="profilePicture"
          title="Avatar"
          render={(_, record: Child) => (
            <Avatar
              size={40}
              src={record.profilePicture}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            >
              {ChildUtils.getInitials(record)}
            </Avatar>
          )}
        />
        <Table.Column
          dataIndex="firstName"
          title="Nombre"
          render={(_, record: Child) => (
            <div>
              <Text strong>{ChildUtils.getFullName(record)}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {ChildUtils.getAgeDisplay(record.birthDate)}
              </Text>
            </div>
          )}
        />
        <Table.Column
          dataIndex="birthDate"
          title="Fecha de Nacimiento"
          render={(birthDate) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {ChildUtils.formatBirthDate(birthDate)}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="birthCity"
          title="Ciudad de Nacimiento"
          render={(birthCity) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {ChildUtils.formatBirthCity(birthCity)}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="address"
          title="Dirección"
          render={(address) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {ChildUtils.formatAddress(address)}
            </Text>
          )}
          ellipsis
        />
        <Table.Column
          dataIndex="hasPaymentAlert"
          title="Estado de Pago"
          render={(hasPaymentAlert) => (
            <Tag color={ChildUtils.getPaymentAlertColor(hasPaymentAlert)}>
              {ChildUtils.getPaymentAlertText(hasPaymentAlert)}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title="Estado"
          render={(isActive) => (
            <Tag color={ChildUtils.getActiveStatusColor(isActive)}>
              {ChildUtils.getActiveStatusText(isActive)}
            </Tag>
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
          render={(_, record: Child) => (
            <Space>
              {canManage && (
                <>
                  <EditButton hideText size="small" recordItemId={record.id} />
                  {isAdmin() && (
                    <DeleteButton hideText size="small" recordItemId={record.id} />
                  )}
                </>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
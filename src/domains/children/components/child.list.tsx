import React from "react";
import { usePermissions } from "@refinedev/core";
import { List, useTable, ShowButton, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Avatar, Typography, Tag } from "antd";
import { UserOutlined, WarningOutlined } from "@ant-design/icons";
import { Child } from "../types/child.types";
import { ChildUtils } from "../utils/child.utils";

const { Text } = Typography;

export const ChildList: React.FC = () => {
  const { data: permissions } = usePermissions({});
  const canEdit = permissions === "administrator" || permissions === "educator";

  const { tableProps } = useTable<Child>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "firstName",
          order: "asc",
        },
      ],
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="profilePicture"
          title="Avatar"
          render={(_, record: Child) => (
            <Avatar
              size={40}
              src={record.profilePicture}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#52c41a" }}
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
                {ChildUtils.formatBirthDate(record.birthDate)} • {ChildUtils.calculateAge(record.birthDate)}
              </Text>
            </div>
          )}
        />
        <Table.Column
          dataIndex="parent"
          title="Padre/Madre"
          render={(parent) => (
            <Text>{ChildUtils.getParentDisplayName({ parent } as Child)}</Text>
          )}
        />
        <Table.Column
          dataIndex="category"
          title="Categoría"
          render={(category) => (
            <Text>{ChildUtils.getCategoryDisplayName({ category } as Child)}</Text>
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
        />
        <Table.Column
          dataIndex="hasPaymentAlert"
          title="Estado"
          render={(_, record: Child) => (
            <Space>
              <Tag color={ChildUtils.getStatusColor(record)}>
                {ChildUtils.getStatusText(record)}
              </Tag>
              {record.hasPaymentAlert && (
                <WarningOutlined style={{ color: "#faad14" }} />
              )}
            </Space>
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
              <ShowButton hideText size="small" recordItemId={record.id} />
              {canEdit && (
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

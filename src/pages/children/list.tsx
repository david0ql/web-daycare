import React from "react";
import { usePermissions } from "@refinedev/core";
import { List, useTable, ShowButton, EditButton, DeleteButton, TagField } from "@refinedev/antd";
import { Table, Space, Avatar, Typography, Tag } from "antd";
import { UserOutlined, WarningOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text } = Typography;

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthCity?: string;
  profilePicture?: string;
  address?: string;
  hasPaymentAlert: boolean;
  isActive: boolean;
  createdAt: string;
}

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

  const calculateAge = (birthDate: string) => {
    const birth = moment(birthDate);
    const now = moment();
    const years = now.diff(birth, "years");
    const months = now.diff(birth, "months") % 12;
    
    if (years > 0) {
      return `${years}a ${months}m`;
    }
    return `${months} meses`;
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="profilePicture"
          title="Foto"
          render={(value, record: Child) => (
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
          render={(value, record: Child) => (
            <Space direction="vertical" size={0}>
              <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
              <Text type="secondary">
                {calculateAge(record.birthDate)} • {record.birthCity || "No especificado"}
              </Text>
            </Space>
          )}
        />
        <Table.Column
          dataIndex="birthDate"
          title="Fecha de Nacimiento"
          render={(value) => moment(value).format("DD/MM/YYYY")}
        />
        <Table.Column
          dataIndex="address"
          title="Dirección"
          render={(value) => value || "No especificado"}
          ellipsis
        />
        <Table.Column
          dataIndex="hasPaymentAlert"
          title="Alerta de Pago"
          render={(value) => (
            <Space>
              {value && <WarningOutlined style={{ color: "#ff4d4f" }} />}
              <TagField
                value={value ? "Pendiente" : "Al día"}
                color={value ? "red" : "green"}
              />
            </Space>
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
          title="Acciones"
          dataIndex="actions"
          render={(_, record: Child) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              {canEdit && (
                <>
                  <EditButton hideText size="small" recordItemId={record.id} />
                  {permissions === "administrator" && (
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

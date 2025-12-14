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
    syncWithLocation: false,
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
    return `${months} months`;
  };

  return (
    <List title="Children List">
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="profilePicture"
          title="Photo"
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
          title="Full Name"
          render={(value, record: Child) => (
            <Space direction="vertical" size={0}>
              <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
              <Text type="secondary">
                {calculateAge(record.birthDate)} • {record.birthCity || "Not specified"}
              </Text>
            </Space>
          )}
        />
        <Table.Column
          dataIndex="birthDate"
          title="Birth Date"
          render={(value) => moment(value).format("DD/MM/YYYY")}
        />
        <Table.Column
          dataIndex="address"
          title="Address"
          render={(value) => value || "Not specified"}
          ellipsis
        />
        <Table.Column
          dataIndex="hasPaymentAlert"
          title="Payment Alert"
          render={(value) => (
            <Space>
              {value && <WarningOutlined style={{ color: "#ff4d4f" }} />}
              <TagField
                value={value ? "Pending" : "Up to date"}
                color={value ? "red" : "green"}
              />
            </Space>
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
          title="Actions"
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

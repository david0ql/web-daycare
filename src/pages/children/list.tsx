import React from "react";
import { usePermissions } from "@refinedev/core";
import { List, useTable, ShowButton, EditButton, DeleteButton, TagField } from "@refinedev/antd";
import { Table, Space, Avatar, Typography } from "antd";
import { UserOutlined, WarningOutlined } from "@ant-design/icons";
import { ChildUtils } from "../../domains/children/utils/child.utils";
import { useLanguage } from "../../shared/contexts/language.context";
import { getIntlLocale } from "../../shared/i18n/locale";

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

const CHILDREN_LIST_TRANSLATIONS = {
  english: {
    title: "Children List",
    photo: "Photo",
    fullName: "Full Name",
    birthDate: "Birth Date",
    address: "Address",
    paymentAlert: "Payment",
    status: "Status",
    actions: "Actions",
  },
  spanish: {
    title: "Lista de niños",
    photo: "Foto",
    fullName: "Nombre completo",
    birthDate: "Fecha de nacimiento",
    address: "Dirección",
    paymentAlert: "Pago",
    status: "Estado",
    actions: "Acciones",
  },
} as const;

export const ChildList: React.FC = () => {
  const { data: permissions } = usePermissions({});
  const canEdit = permissions === "administrator" || permissions === "educator";
  const { language } = useLanguage();
  const t = CHILDREN_LIST_TRANSLATIONS[language];
  const intlLocale = getIntlLocale(language);

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

  return (
    <List title={t.title}>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="profilePicture"
          title={t.photo}
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
          title={t.fullName}
          render={(value, record: Child) => (
            <Space direction="vertical" size={0}>
              <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
              <Text type="secondary">
                {ChildUtils.getAgeDisplay(record.birthDate, language)} •{" "}
                {ChildUtils.formatBirthCity(record.birthCity, language)}
              </Text>
            </Space>
          )}
        />
        <Table.Column
          dataIndex="birthDate"
          title={t.birthDate}
          render={(value) => new Date(value).toLocaleDateString(intlLocale)}
        />
        <Table.Column
          dataIndex="address"
          title={t.address}
          render={(value) => ChildUtils.formatAddress(value, language)}
          ellipsis
        />
        <Table.Column
          dataIndex="hasPaymentAlert"
          title={t.paymentAlert}
          render={(value) => (
            <Space>
              {value && <WarningOutlined style={{ color: "#ff4d4f" }} />}
              <TagField
                value={ChildUtils.getPaymentAlertText(value, language)}
                color={value ? "red" : "green"}
              />
            </Space>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title={t.status}
          render={(value) => (
            <TagField
              value={ChildUtils.getActiveStatusText(value, language)}
              color={value ? "green" : "red"}
            />
          )}
        />
        <Table.Column
          title={t.actions}
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

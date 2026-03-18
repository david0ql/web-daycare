import React, { useState, useMemo } from "react";
import {
  List,
  useTable,
  EditButton,
  DeleteButton,
  CreateButton,
} from "@refinedev/antd";
import { Table, Space, Tag, Avatar, Typography, Button } from "antd";
import {
  UserOutlined,
  UserAddOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { Child } from "../types/child.types";
import { ChildUtils } from "../utils/child.utils";
import { useAuth } from "../../../shared/hooks/use-auth.hook";
import { useLanguage } from "../../../shared/contexts/language.context";
import { QRGenerator } from "./qr-generator.component";

const { Text } = Typography;

const CHILD_LIST_TRANSLATIONS = {
  english: {
    childrenList: "Children List",
    newChild: "New Child",
    avatar: "Avatar",
    name: "Name",
    birthDate: "Birth Date",
    birthCity: "Birth City",
    address: "Address",
    paymentStatus: "Payment Status",
    status: "Status",
    registrationDate: "Registration Date",
    actions: "Actions",
    generateQR: "Generate QR Code",
    paymentAlert: "Payment Alert",
    upToDate: "Up to Date",
    active: "Active",
    inactive: "Inactive",
    noData: "No data",
    notSpecified: "Not specified",
  },
  spanish: {
    childrenList: "Lista de niños",
    newChild: "Nuevo niño",
    avatar: "Avatar",
    name: "Nombre",
    birthDate: "Fecha de nacimiento",
    birthCity: "Ciudad de nacimiento",
    address: "Dirección",
    paymentStatus: "Estado de pago",
    status: "Estado",
    registrationDate: "Fecha de registro",
    actions: "Acciones",
    generateQR: "Generar código QR",
    paymentAlert: "Alerta de pago",
    upToDate: "Al día",
    active: "Activo",
    inactive: "Inactivo",
    noData: "Sin datos",
    notSpecified: "No especificado",
  },
} as const;

export const ChildList: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isEducator } = useAuth();
  const { language } = useLanguage();
  const t = CHILD_LIST_TRANSLATIONS[language];
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const getPaymentAlertText = (hasPaymentAlert: boolean) =>
    hasPaymentAlert ? t.paymentAlert : t.upToDate;
  const getActiveStatusText = (isActive: boolean) =>
    isActive ? t.active : t.inactive;
  const formatAddress = (address?: string) =>
    address
      ? address.length > 50
        ? `${address.substring(0, 50)}...`
        : address
      : t.notSpecified;
  const formatBirthCity = (birthCity?: string) => birthCity || t.notSpecified;
  const formatBirthDate = (birthDate: string) =>
    ChildUtils.parseDateOnly(birthDate).toLocaleDateString(
      language === "spanish" ? "es-ES" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

  const { tableProps } = useTable<Child>({
    syncWithLocation: false,
    pagination: {
      pageSize: 10,
    },
    sorters: {
      initial: [
        {
          field: "firstName",
          order: "asc",
        },
      ],
    },
  });

  const sortedDataSource = useMemo(() => {
    if (!tableProps.dataSource) return tableProps.dataSource;
    return [...tableProps.dataSource].sort((a, b) => {
      const nameA = `${a.firstName ?? ""} ${a.lastName ?? ""}`.toLowerCase();
      const nameB = `${b.firstName ?? ""} ${b.lastName ?? ""}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [tableProps.dataSource]);

  const canManage = isAdmin() || isEducator();

  const handleOpenQRModal = (child: Child) => {
    setSelectedChild(child);
    setQrModalVisible(true);
  };

  const handleCloseQRModal = () => {
    setQrModalVisible(false);
    setSelectedChild(null);
  };

  return (
    <List
      title={t.childrenList}
      headerButtons={
        canManage ? (
          <CreateButton
            icon={<UserAddOutlined />}
            onClick={() => navigate("/children/create")}
          >
            {t.newChild}
          </CreateButton>
        ) : undefined
      }
    >
      <Table
        {...tableProps}
        dataSource={sortedDataSource}
        rowKey="id"
        locale={{ emptyText: t.noData }}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            language === "spanish"
              ? `${range[0]}-${range[1]} de ${total} registros`
              : `${range[0]}-${range[1]} of ${total} records`,
        }}
      >
        <Table.Column
          dataIndex="profilePicture"
          title={t.avatar}
          render={(_, record: Child) => {
            const src = record.profilePicture
              ? record.profilePicture.startsWith("http")
                ? record.profilePicture
                : `https://api.thechildrenworld.com/api${record.profilePicture}`
              : null;
            return src ? (
              <img
                src={src}
                alt={ChildUtils.getFullName(record)}
                width={40}
                height={40}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#1890ff",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {ChildUtils.getInitials(record)}
              </span>
            );
          }}
        />
        <Table.Column
          dataIndex="firstName"
          title={t.name}
          render={(_, record: Child) => (
            <div>
              <Text strong>{ChildUtils.getFullName(record)}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {ChildUtils.getAgeDisplay(record.birthDate, language)}
              </Text>
            </div>
          )}
        />
        <Table.Column
          dataIndex="birthDate"
          title={t.birthDate}
          render={(birthDate) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {formatBirthDate(birthDate)}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="birthCity"
          title={t.birthCity}
          render={(birthCity) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {formatBirthCity(birthCity)}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="address"
          title={t.address}
          render={(address) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {formatAddress(address)}
            </Text>
          )}
          ellipsis
        />
        <Table.Column
          dataIndex="hasPaymentAlert"
          title={t.paymentStatus}
          render={(hasPaymentAlert) => (
            <Tag color={ChildUtils.getPaymentAlertColor(hasPaymentAlert)}>
              {getPaymentAlertText(hasPaymentAlert)}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title={t.status}
          render={(isActive) => (
            <Tag color={ChildUtils.getActiveStatusColor(isActive)}>
              {getActiveStatusText(isActive)}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title={t.registrationDate}
          render={(date) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {new Date(date).toLocaleDateString(
                language === "spanish" ? "es-ES" : "en-US",
              )}
            </Text>
          )}
        />
        <Table.Column
          title={t.actions}
          dataIndex="actions"
          render={(_, record: Child) => (
            <Space>
              <Button
                type="default"
                icon={<QrcodeOutlined />}
                size="small"
                onClick={() => handleOpenQRModal(record)}
                title={t.generateQR}
              />
              {canManage && (
                <>
                  <EditButton hideText size="small" recordItemId={record.id} />
                  {isAdmin() && (
                    <DeleteButton
                      hideText
                      size="small"
                      recordItemId={record.id}
                    />
                  )}
                </>
              )}
            </Space>
          )}
        />
      </Table>

      {selectedChild && (
        <QRGenerator
          child={selectedChild}
          visible={qrModalVisible}
          onClose={handleCloseQRModal}
        />
      )}
    </List>
  );
};

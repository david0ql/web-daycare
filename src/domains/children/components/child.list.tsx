import React, { useState } from "react";
import { List, useTable, EditButton, DeleteButton, TagField, CreateButton } from "@refinedev/antd";
import { Table, Space, Tag, Avatar, Typography, Button } from "antd";
import { UserOutlined, UserAddOutlined, QrcodeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { Child } from "../types/child.types";
import { ChildUtils } from "../utils/child.utils";
import { useAuth } from "../../../shared/hooks/use-auth.hook";
import { QRGenerator } from "./qr-generator.component";

const { Text } = Typography;

export const ChildList: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isEducator } = useAuth();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

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
      headerButtons={
        canManage ? (
          <CreateButton
            icon={<UserAddOutlined />}
            onClick={() => navigate("/children/create")}
          >
            New Child
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
          title="Name"
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
          title="Birth Date"
          render={(birthDate) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {ChildUtils.formatBirthDate(birthDate)}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="birthCity"
          title="Birth City"
          render={(birthCity) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {ChildUtils.formatBirthCity(birthCity)}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="address"
          title="Address"
          render={(address) => (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {ChildUtils.formatAddress(address)}
            </Text>
          )}
          ellipsis
        />
        <Table.Column
          dataIndex="hasPaymentAlert"
          title="Payment Status"
          render={(hasPaymentAlert) => (
            <Tag color={ChildUtils.getPaymentAlertColor(hasPaymentAlert)}>
              {ChildUtils.getPaymentAlertText(hasPaymentAlert)}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title="Status"
          render={(isActive) => (
            <Tag color={ChildUtils.getActiveStatusColor(isActive)}>
              {ChildUtils.getActiveStatusText(isActive)}
            </Tag>
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
          render={(_, record: Child) => (
            <Space>
              <Button
                type="default"
                icon={<QrcodeOutlined />}
                size="small"
                onClick={() => handleOpenQRModal(record)}
                title="Generate QR Code"
              />
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
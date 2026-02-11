import React from "react";
import { Show, TextField, DateField, ListButton, RefreshButton } from "@refinedev/antd";
import { Typography, Space, Tag, Avatar, Card, Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ChildUtils } from "../../domains/children/utils/child.utils";
import { useLanguage } from "../../shared/contexts/language.context";
import { useShow } from "@refinedev/core";

const { Title, Text } = Typography;

const CHILD_SHOW_TRANSLATIONS = {
  english: {
    title: "Child Details",
    personalInfo: "Personal Information",
    status: "Status",
    birthDate: "Birth Date",
    birthCity: "Birth City",
    address: "Address",
    paymentStatus: "Payment Status",
    activeStatus: "Active Status",
    registrationDate: "Registration Date",
    paymentAlert: "Payment Alert",
    upToDate: "Up to Date",
    active: "Active",
    inactive: "Inactive",
    children: "Children",
    refresh: "Refresh",
  },
  spanish: {
    title: "Detalles del niño",
    personalInfo: "Información personal",
    status: "Estado",
    birthDate: "Fecha de nacimiento",
    birthCity: "Ciudad de nacimiento",
    address: "Dirección",
    paymentStatus: "Estado de pago",
    activeStatus: "Estado activo",
    registrationDate: "Fecha de registro",
    paymentAlert: "Alerta de pago",
    upToDate: "Al día",
    active: "Activo",
    inactive: "Inactivo",
    children: "Niños",
    refresh: "Actualizar",
  },
} as const;

export const ChildShow: React.FC = () => {
  const { language } = useLanguage();
  const t = CHILD_SHOW_TRANSLATIONS[language];
  const { query } = useShow<any>();
  const record = query?.data?.data;

  return (
    <Show
      title={t.title}
      headerButtons={({ listButtonProps, refreshButtonProps }) => (
        <>
          {listButtonProps && <ListButton {...listButtonProps}>{t.children}</ListButton>}
          <RefreshButton {...refreshButtonProps}>{t.refresh}</RefreshButton>
        </>
      )}
    >
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space align="center" size="large">
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  <TextField value="firstName" /> <TextField value="lastName" />
                </Title>
                <Text type="secondary">
                  {record?.birthDate && ChildUtils.getAgeDisplay(record.birthDate, language)}
                </Text>
              </div>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card size="small" title={t.personalInfo}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>{t.birthDate}:</Text>
                  <br />
                  <DateField value="birthDate" format="YYYY-MM-DD" />
                </div>
                <div>
                  <Text strong>{t.birthCity}:</Text>
                  <br />
                  <TextField value="birthCity" />
                </div>
                <div>
                  <Text strong>{t.address}:</Text>
                  <br />
                  <TextField value="address" />
                </div>
              </Space>
            </Card>
          </Col>

          <Col span={12}>
            <Card size="small" title={t.status}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>{t.paymentStatus}:</Text>
                  <br />
                  <Tag color={ChildUtils.getPaymentAlertColor(record?.hasPaymentAlert ?? false)}>
                    {record?.hasPaymentAlert ? t.paymentAlert : t.upToDate}
                  </Tag>
                </div>
                <div>
                  <Text strong>{t.activeStatus}:</Text>
                  <br />
                  <Tag color={ChildUtils.getActiveStatusColor(record?.isActive ?? true)}>
                    {record?.isActive ? t.active : t.inactive}
                  </Tag>
                </div>
                <div>
                  <Text strong>{t.registrationDate}:</Text>
                  <br />
                  <DateField value="createdAt" format="YYYY-MM-DD HH:mm" />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </Show>
  );
};

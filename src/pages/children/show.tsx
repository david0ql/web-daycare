import React from "react";
import { useShow, usePermissions } from "@refinedev/core";
import { Show, TagField, EditButton, DeleteButton } from "@refinedev/antd";
import { Typography, Card, Row, Col, Space, Avatar, Divider, Alert } from "antd";
import { UserOutlined, CalendarOutlined, EnvironmentOutlined, WarningOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;

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
  updatedAt: string;
}

export const ChildShow: React.FC = () => {
  const { queryResult } = useShow<Child>();
  const { data: permissions } = usePermissions({});
  const canEdit = permissions === "administrator" || permissions === "educator";

  const { data, isLoading } = queryResult;
  const record = data?.data;

  const calculateAge = (birthDate: string) => {
    const birth = moment(birthDate);
    const now = moment();
    const years = now.diff(birth, "years");
    const months = now.diff(birth, "months") % 12;
    
    if (years > 0) {
      return `${years} año${years > 1 ? "s" : ""} y ${months} mes${months !== 1 ? "es" : ""}`;
    }
    return `${months} mes${months !== 1 ? "es" : ""}`;
  };

  return (
    <Show
      isLoading={isLoading}
      headerButtons={
        canEdit ? (
          <Space>
            <EditButton />
            {permissions === "administrator" && <DeleteButton />}
          </Space>
        ) : undefined
      }
    >
      {record && (
        <>
          {record.hasPaymentAlert && (
            <Alert
              message="Alerta de Pago"
              description="Este niño tiene pagos pendientes. Contacte con los padres."
              type="warning"
              icon={<WarningOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Card>
            <Row gutter={[16, 16]}>
              <Col span={24} md={8}>
                <div style={{ textAlign: "center" }}>
                  <Avatar
                    size={120}
                    src={record.profilePicture}
                    icon={<UserOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                  <div>
                    <Title level={3} style={{ marginBottom: 8 }}>
                      {`${record.firstName} ${record.lastName}`}
                    </Title>
                    <Text type="secondary" style={{ fontSize: "16px", marginBottom: 16, display: "block" }}>
                      {calculateAge(record.birthDate)}
                    </Text>
                    <div>
                      <TagField
                        value={record.isActive ? "Activo" : "Inactivo"}
                        color={record.isActive ? "green" : "red"}
                      />
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col span={24} md={16}>
                <Title level={4}>Información Personal</Title>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div>
                    <Text strong>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      Fecha de Nacimiento:
                    </Text>
                    <Text style={{ marginLeft: 8 }}>
                      {moment(record.birthDate).format("DD/MM/YYYY")}
                    </Text>
                  </div>
                  
                  {record.birthCity && (
                    <div>
                      <Text strong>Ciudad de Nacimiento:</Text>
                      <Text style={{ marginLeft: 8 }}>{record.birthCity}</Text>
                    </div>
                  )}
                  
                  {record.address && (
                    <div>
                      <Text strong>
                        <EnvironmentOutlined style={{ marginRight: 8 }} />
                        Dirección:
                      </Text>
                      <Text style={{ marginLeft: 8 }}>{record.address}</Text>
                    </div>
                  )}
                </Space>

                <Divider />

                <Title level={4}>Estado de Cuenta</Title>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div>
                    <Text strong>Estado de Pago:</Text>
                    <Space style={{ marginLeft: 8 }}>
                      {record.hasPaymentAlert && <WarningOutlined style={{ color: "#ff4d4f" }} />}
                      <TagField
                        value={record.hasPaymentAlert ? "Pagos Pendientes" : "Al Día"}
                        color={record.hasPaymentAlert ? "red" : "green"}
                      />
                    </Space>
                  </div>
                </Space>

                <Divider />

                <Title level={4}>Información del Sistema</Title>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div>
                    <Text strong>Fecha de Registro:</Text>
                    <Text style={{ marginLeft: 8 }}>
                      {moment(record.createdAt).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </div>
                  
                  <div>
                    <Text strong>Última Actualización:</Text>
                    <Text style={{ marginLeft: 8 }}>
                      {moment(record.updatedAt).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </Show>
  );
};

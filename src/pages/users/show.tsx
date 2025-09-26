import React, { useState, useEffect } from "react";
import { usePermissions } from "@refinedev/core";
import { Show, EditButton, DeleteButton } from "@refinedev/antd";
import { Space, Typography, Card, Row, Col, Avatar, Tag } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export const UserShow: React.FC = () => {
  const { data: permissions } = usePermissions({});
  const isAdmin = permissions?.includes("administrator");
  
  const [record, setRecord] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = window.location.pathname.split('/').pop();
        const token = localStorage.getItem("refine-auth");
        
        const response = await fetch(`http://localhost:30000/api/users/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setRecord(userData);
        } else {
          console.error("Error loading user:", response.statusText);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "administrator":
        return "red";
      case "educator":
        return "blue";
      case "parent":
        return "green";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!record) {
    return <div>Usuario no encontrado</div>;
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Nunca";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <Show
      headerButtons={
        isAdmin ? (
          <Space>
            <EditButton />
            <DeleteButton />
          </Space>
        ) : undefined
      }
    >
      <Card>
        <Row gutter={[24, 24]}>
          <Col span={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <div>
                <Title level={3} style={{ marginBottom: 8 }}>
                  {`${record.firstName} ${record.lastName}`}
                </Title>
                <Tag color={getRoleColor(record.role?.name || "")} style={{ marginBottom: 16 }}>
                  {record.role?.description || record.role?.name || "Sin rol"}
                </Tag>
                <div>
                  <Tag color={record.isActive ? "green" : "red"}>
                    {record.isActive ? "Activo" : "Inactivo"}
                  </Tag>
                </div>
              </div>
            </div>
          </Col>
          
          <Col span={24} md={16}>
            <Title level={4}>Información de Contacto</Title>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>
                  <MailOutlined style={{ marginRight: 8 }} />
                  Email:
                </Text>
                <Text style={{ marginLeft: 8 }}>{record.email}</Text>
              </div>
              
              <div>
                <Text strong>
                  <PhoneOutlined style={{ marginRight: 8 }} />
                  Teléfono:
                </Text>
                <Text style={{ marginLeft: 8 }}>{record.phone || "No especificado"}</Text>
              </div>
            </Space>

            <Title level={4} style={{ marginTop: 24 }}>Información del Sistema</Title>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Último Acceso:
                </Text>
                <Text style={{ marginLeft: 8 }}>{formatDate(record.lastLogin)}</Text>
              </div>
              
              <div>
                <Text strong>Fecha de Registro:</Text>
                <Text style={{ marginLeft: 8 }}>{formatDate(record.createdAt)}</Text>
              </div>
              
              <div>
                <Text strong>Última Actualización:</Text>
                <Text style={{ marginLeft: 8 }}>{formatDate(record.updatedAt)}</Text>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </Show>
  );
};
import React, { useState } from "react";
import { Layout, Avatar, Dropdown, Space, Typography, Button, Badge, Tooltip } from "antd";
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined, 
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  DashboardOutlined
} from "@ant-design/icons";
import { colors } from "../styles/colors.styles";
import { EnhancedSidebar } from "./enhanced-sidebar.component";
import { useAuth } from "../hooks/use-auth.hook";

const { Text } = Typography;

interface CustomLayoutProps {
  children: React.ReactNode;
}

export const CustomLayout: React.FC<CustomLayoutProps> = ({ children }) => {
  const { 
    user, 
    permissions, 
    logout, 
    getUserFullName, 
    getUserRoleLabel 
  } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Perfil",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Configuración",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      onClick: logout,
    },
  ];

  const notificationItems = [
    {
      key: "1",
      label: "Nuevo niño registrado",
      description: "María García se ha registrado",
    },
    {
      key: "2",
      label: "Recordatorio de pago",
      description: "3 pagos pendientes",
    },
    {
      key: "3",
      label: "Incidente reportado",
      description: "Se reportó un incidente menor",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Enhanced Sidebar */}
      <EnhancedSidebar 
        collapsed={collapsed} 
        onCollapse={setCollapsed} 
      />

      {/* Main Layout */}
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 280,
        transition: "margin-left 0.2s",
      }}>
        {/* Header */}
        <Layout.Header style={{
          background: colors.background.primary,
          borderBottom: `1px solid ${colors.border.light}`,
          boxShadow: colors.shadows.sm,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ 
                color: colors.text.primary,
                border: "none",
                boxShadow: "none"
              }}
            />
            <Text strong style={{ 
              fontSize: "18px", 
              color: colors.text.primary 
            }}>
              The Children's World
            </Text>
          </Space>

          <Space size="middle">
            {/* Notifications */}
            <Dropdown
              menu={{ items: notificationItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Tooltip title="Notificaciones">
                <Badge count={3} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    style={{ 
                      color: colors.text.primary,
                      border: "none",
                      boxShadow: "none"
                    }}
                  />
                </Badge>
              </Tooltip>
            </Dropdown>

            {/* User Menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ 
                    backgroundColor: colors.primary.main,
                    color: "white"
                  }}
                />
                <div style={{ textAlign: "left" }}>
                  <Text strong style={{ color: colors.text.primary, fontSize: "14px" }}>
                    {getUserFullName()}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {getUserRoleLabel()}
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Layout.Header>

        {/* Content */}
        <Layout.Content style={{
          background: colors.background.secondary,
          padding: "24px",
          minHeight: "calc(100vh - 64px)",
        }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

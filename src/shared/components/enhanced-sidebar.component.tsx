import React, { useState } from "react";
import { Layout, Menu, Avatar, Typography, Space, Button } from "antd";
import { 
  UserOutlined, 
  TeamOutlined, 
  UserAddOutlined,
  FileTextOutlined,
  CalendarOutlined,
  WarningOutlined,
  MessageOutlined,
  BarChartOutlined,
  DashboardOutlined,
  LogoutOutlined,
  HomeOutlined,
  BookOutlined,
  SafetyOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router";
import { colors } from "../styles/colors.styles";
import { useAuth } from "../hooks/use-auth.hook";
import { useAppNavigation } from "../hooks/use-navigation.hook";

const { Sider } = Layout;
const { Text } = Typography;

interface EnhancedSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  collapsed, 
  onCollapse 
}) => {
  const { 
    user, 
    permissions, 
    logout, 
    getUserFullName, 
    getUserRoleLabel, 
    getUserRoleColor,
    isAdmin,
    isEducator,
    isParent
  } = useAuth();
  const { navigateTo } = useAppNavigation();
  const navigate = useNavigate();
  const location = useLocation();



  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      path: "/",
    },
    {
      key: "users",
      icon: <TeamOutlined />,
      label: "Usuarios",
      children: [
        {
          key: "/users",
          icon: <UserOutlined />,
          label: "Lista de Usuarios",
          path: "/users",
        },
        ...(isAdmin() ? [{
          key: "/users/create",
          icon: <UserAddOutlined />,
          label: "Crear Usuario",
          path: "/users/create",
        }] : []),
      ],
    },
    {
      key: "children",
      icon: <UserOutlined />,
      label: "Niños",
      children: [
        {
          key: "/children",
          icon: <UserOutlined />,
          label: "Lista de Niños",
          path: "/children",
        },
        ...((isAdmin() || isEducator()) ? [{
          key: "/children/create",
          icon: <UserAddOutlined />,
          label: "Registrar Niño",
          path: "/children/create",
        }] : []),
      ],
    },
    {
      key: "attendance",
      icon: <FileTextOutlined />,
      label: "Asistencia",
      children: [
        {
          key: "/attendance",
          icon: <FileTextOutlined />,
          label: "Registro de Asistencia",
          path: "/attendance",
        },
        ...((isAdmin() || isEducator()) ? [{
          key: "/attendance/create",
          icon: <UserAddOutlined />,
          label: "Marcar Asistencia",
          path: "/attendance/create",
        }] : []),
      ],
    },
    {
      key: "incidents",
      icon: <WarningOutlined />,
      label: "Incidentes",
      children: [
        {
          key: "/incidents",
          icon: <WarningOutlined />,
          label: "Lista de Incidentes",
          path: "/incidents",
        },
        ...((isAdmin() || isEducator()) ? [{
          key: "/incidents/create",
          icon: <UserAddOutlined />,
          label: "Reportar Incidente",
          path: "/incidents/create",
        }] : []),
      ],
    },
    {
      key: "calendar",
      icon: <CalendarOutlined />,
      label: "Calendario",
      children: [
        {
          key: "/calendar",
          icon: <CalendarOutlined />,
          label: "Vista de Calendario",
          path: "/calendar",
        },
        ...((isAdmin() || isEducator()) ? [{
          key: "/calendar/create",
          icon: <UserAddOutlined />,
          label: "Crear Evento",
          path: "/calendar/create",
        }] : []),
      ],
    },
    {
      key: "documents",
      icon: <BookOutlined />,
      label: "Documentos",
      children: [
        {
          key: "/documents",
          icon: <BookOutlined />,
          label: "Lista de Documentos",
          path: "/documents",
        },
        ...((isAdmin() || isEducator()) ? [{
          key: "/documents/create",
          icon: <UserAddOutlined />,
          label: "Subir Documento",
          path: "/documents/create",
        }] : []),
      ],
    },
    {
      key: "messaging",
      icon: <MessageOutlined />,
      label: "Mensajes",
      children: [
        {
          key: "/messaging",
          icon: <MessageOutlined />,
          label: "Bandeja de Entrada",
          path: "/messaging",
        },
        ...((isAdmin() || isEducator()) ? [{
          key: "/messaging/create",
          icon: <UserAddOutlined />,
          label: "Nuevo Mensaje",
          path: "/messaging/create",
        }] : []),
      ],
    },
    ...(isAdmin() ? [{
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Reportes",
      children: [
        {
          key: "/reports",
          icon: <BarChartOutlined />,
          label: "Vista de Reportes",
          path: "/reports",
        },
      ],
    }] : []),
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    const findPath = (items: any[], targetKey: string): string | null => {
      for (const item of items) {
        if (item.key === targetKey) {
          return item.path;
        }
        if (item.children) {
          const found = findPath(item.children, targetKey);
          if (found) return found;
        }
      }
      return null;
    };

    const path = findPath(menuItems, key);
    if (path) {
      navigateTo(path);
    }
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === "/") return ["/"];
    
    const findKey = (items: any[], targetPath: string): string[] => {
      for (const item of items) {
        if (item.path === targetPath) {
          return [item.key];
        }
        if (item.children) {
          const found = findKey(item.children, targetPath);
          if (found.length > 0) {
            return [item.key, ...found];
          }
        }
      }
      return [];
    };

    return findKey(menuItems, path);
  };

  const getOpenKeys = () => {
    const selectedKeys = getSelectedKeys();
    return selectedKeys.slice(0, -1);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      style={{
        background: colors.background.primary,
        borderRight: `1px solid ${colors.border.light}`,
        boxShadow: colors.shadows.lg,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ 
          padding: "20px 16px",
          borderBottom: `1px solid ${colors.border.light}`,
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
          color: "white",
          textAlign: "center"
        }}>
          <HomeOutlined style={{ fontSize: "32px", marginBottom: "8px" }} />
          {!collapsed && (
            <>
              <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>
                The Children's World
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                Sistema de Gestión
              </div>
            </>
          )}
        </div>

        {/* User Info */}
        <div style={{
          padding: "16px",
          borderBottom: `1px solid ${colors.border.light}`,
          background: colors.background.secondary,
        }}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Space>
                <Avatar
                  size={collapsed ? "small" : "default"}
                  icon={<UserOutlined />}
                  style={{ 
                    backgroundColor: getUserRoleColor(),
                    color: "white"
                  }}
                />
              {!collapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: 600,
                    color: colors.text.primary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {getUserFullName()}
                  </div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: getUserRoleColor(),
                    fontWeight: 500
                  }}>
                    {getUserRoleLabel()}
                  </div>
                </div>
              )}
            </Space>
            
          </Space>
        </div>

        {/* Menu */}
        <div style={{ 
          flex: 1, 
          overflowY: "auto",
          padding: "8px 0"
        }}>
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
            onClick={handleMenuClick}
            style={{
              background: "transparent",
              border: "none",
            }}
            items={menuItems}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px",
          borderTop: `1px solid ${colors.border.light}`,
          background: colors.background.secondary,
        }}>
          {!collapsed && (
            <div style={{ 
              textAlign: "center",
              marginBottom: "12px"
            }}>
              <Text type="secondary" style={{ fontSize: "11px" }}>
                The Children's World v1.0
              </Text>
            </div>
          )}
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={logout}
            style={{
              width: "100%",
              color: colors.text.secondary,
              border: "none",
              height: "36px",
            }}
          >
            {!collapsed && "Cerrar Sesión"}
          </Button>
        </div>
      </div>
    </Sider>
  );
};

import React, { useState } from "react";
import { Layout, Avatar, Dropdown, Space, Typography, Button } from "antd";
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined, 
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from "@ant-design/icons";
import { colors } from "../styles/colors.styles";
import { EnhancedSidebar } from "./enhanced-sidebar.component";
import { useAuth } from "../hooks/use-auth.hook";
import "../styles/navbar.styles.css";
import { useLanguage } from "../contexts/language.context";

const { Text } = Typography;

interface CustomLayoutProps {
  children: React.ReactNode;
}

const CUSTOM_LAYOUT_TRANSLATIONS = {
  english: {
    logOut: "Log Out",
  },
  spanish: {
    logOut: "Cerrar sesión",
  },
} as const;

export const CustomLayout: React.FC<CustomLayoutProps> = ({ children }) => {
  const { 
    user, 
    permissions, 
    logout, 
    getUserFullName, 
    getUserRoleLabel 
  } = useAuth();
  const { language } = useLanguage();
  const t = CUSTOM_LAYOUT_TRANSLATIONS[language];
  const [collapsed, setCollapsed] = useState(false);

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t.logOut,
      onClick: logout,
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
          <Space className="navbar-header">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ 
                color: colors.text.primary,
                border: "none",
                boxShadow: "none",
                flexShrink: 0
              }}
            />
            <Text 
              strong 
              style={{ 
                fontSize: "18px", 
                color: colors.secondary.light,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "300px",
                display: "block"
              }}
              className="navbar-title"
            >
              The Children's World
            </Text>
          </Space>

          <Space size="middle" className="navbar-user-menu">
            {/* User Menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Space style={{ cursor: "pointer", maxWidth: "200px" }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ 
                    backgroundColor: colors.accent.main,
                    color: "white",
                    boxShadow: colors.shadows.sm
                  }}
                />
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <Text 
                    strong 
                    style={{ 
                      color: colors.text.primary, 
                      fontSize: "14px",
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "120px"
                    }}
                  >
                    {getUserFullName()}
                  </Text>
                  <Text 
                    type="secondary" 
                    style={{ 
                      fontSize: "12px",
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "120px",
                      color: colors.accent.main
                    }}
                  >
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

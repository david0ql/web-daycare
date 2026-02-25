import React, { useState } from "react";
import { Layout, Menu, Avatar, Typography, Space, Button, Modal, Switch } from "antd";
import { 
  UserOutlined, 
  TeamOutlined, 
  UserAddOutlined,
  FileTextOutlined,
  CalendarOutlined,
  WarningOutlined,
  BarChartOutlined,
  DashboardOutlined,
  LogoutOutlined,
  BookOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CameraOutlined,
  GlobalOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router";
import { colors } from "../styles/colors.styles";
import { useAuth } from "../hooks/use-auth.hook";

// Colores por sección (igual que app móvil): items principales varían, sub-items uniforme
const SECTION_ITEM_BG: Record<string, string> = {
  "/": "#F0F4F8",        // dashboard – gris azulado suave
  users: "#E3F2FD",      // usuarios – azul muy claro
  children: "#FFF4D6",   // amarillo pastel
  attendance: "#D4E8F7", // azul pastel
  incidents: "#FFE0E8",  // rosa pastel
  calendar: "#FFE8DC",   // melocotón pastel
  documents: "#E8F5E9",  // verde pastel
  reports: "#FFF8E1",   // amarillo muy suave
  language: "#E8E0F5",  // lavanda
};
const SUB_ITEM_BG = "#FFFFFF";
const DEFAULT_ITEM_BG = "#F0E8F5";
import { useAppNavigation } from "../hooks/use-navigation.hook";
import { useLanguage } from "../contexts/language.context";

const { Sider } = Layout;
const { Text } = Typography;

const SIDEBAR_TRANSLATIONS = {
  english: {
    appName: "The Children's World",
    logoAlt: "The Children's World Learning Center",
    managementSystem: "Management System",
    version: "The Children's World v1.0",
    dashboard: "Dashboard",
    users: "Users",
    userList: "User List",
    createUser: "Create User",
    children: "Children",
    childrenList: "Children List",
    registerChild: "Register Child",
    attendance: "Attendance",
    attendanceRecord: "Attendance Record",
    markAttendance: "Mark Attendance",
    dailyActivities: "Daily Activities",
    observations: "Observations",
    activityPhotos: "Activity Photos",
    incidents: "Incidents",
    incidentsList: "Incidents List",
    reportIncident: "Report Incident",
    calendar: "Calendar",
    calendarView: "Calendar View",
    createEvent: "Create Event",
    documents: "Documents",
    documentsList: "Documents List",
    uploadDocument: "Upload Document",
    language: "Language",
    reports: "Reports",
    reportsView: "Reports View",
    selectLanguage: "Select language",
    logOut: "Log Out",
  },
  spanish: {
    appName: "The Children's World",
    logoAlt: "The Children's World - Centro educativo",
    managementSystem: "Sistema de gestión",
    version: "The Children's World v1.0",
    dashboard: "Panel",
    users: "Usuarios",
    userList: "Lista de usuarios",
    createUser: "Crear usuario",
    children: "Niños",
    childrenList: "Lista de niños",
    registerChild: "Registrar niño",
    attendance: "Asistencia",
    attendanceRecord: "Registro de asistencia",
    markAttendance: "Marcar asistencia",
    dailyActivities: "Actividades diarias",
    observations: "Observaciones",
    activityPhotos: "Fotos de actividades",
    incidents: "Incidentes",
    incidentsList: "Lista de incidentes",
    reportIncident: "Reportar incidente",
    calendar: "Calendario",
    calendarView: "Vista de calendario",
    createEvent: "Crear evento",
    documents: "Documentos",
    documentsList: "Lista de documentos",
    uploadDocument: "Subir documento",
    language: "Idioma",
    reports: "Reportes",
    reportsView: "Vista de reportes",
    selectLanguage: "Seleccionar idioma",
    logOut: "Cerrar sesión",
  },
} as const;

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
  const { language, setLanguage } = useLanguage();
  const t = SIDEBAR_TRANSLATIONS[language];

  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: t.dashboard,
      path: "/",
      style: { backgroundColor: SECTION_ITEM_BG["/"] ?? DEFAULT_ITEM_BG },
    },
    {
      key: "users",
      icon: <TeamOutlined />,
      label: t.users,
      style: { backgroundColor: SECTION_ITEM_BG.users ?? DEFAULT_ITEM_BG },
      children: [
        { key: "/users", icon: <UserOutlined />, label: t.userList, path: "/users", style: { backgroundColor: SUB_ITEM_BG } },
        ...(isAdmin() ? [{ key: "/users/create", icon: <UserAddOutlined />, label: t.createUser, path: "/users/create", style: { backgroundColor: SUB_ITEM_BG } }] : []),
      ],
    },
    {
      key: "children",
      icon: <UserOutlined />,
      label: t.children,
      style: { backgroundColor: SECTION_ITEM_BG.children ?? DEFAULT_ITEM_BG },
      children: [
        { key: "/children", icon: <UserOutlined />, label: t.childrenList, path: "/children", style: { backgroundColor: SUB_ITEM_BG } },
        ...((isAdmin() || isEducator()) ? [{ key: "/children/create", icon: <UserAddOutlined />, label: t.registerChild, path: "/children/create", style: { backgroundColor: SUB_ITEM_BG } }] : []),
      ],
    },
    {
      key: "attendance",
      icon: <FileTextOutlined />,
      label: t.attendance,
      style: { backgroundColor: SECTION_ITEM_BG.attendance ?? DEFAULT_ITEM_BG },
      children: [
        { key: "/attendance", icon: <FileTextOutlined />, label: t.attendanceRecord, path: "/attendance", style: { backgroundColor: SUB_ITEM_BG } },
        ...((isAdmin() || isEducator()) ? [{ key: "/attendance/create", icon: <UserAddOutlined />, label: t.markAttendance, path: "/attendance/create", style: { backgroundColor: SUB_ITEM_BG } }] : []),
        { key: "/attendance/activities", icon: <CheckCircleOutlined />, label: t.dailyActivities, path: "/attendance/activities", style: { backgroundColor: SUB_ITEM_BG } },
        { key: "/attendance/observations", icon: <EyeOutlined />, label: t.observations, path: "/attendance/observations", style: { backgroundColor: SUB_ITEM_BG } },
        { key: "/attendance/photos", icon: <CameraOutlined />, label: t.activityPhotos, path: "/attendance/photos", style: { backgroundColor: SUB_ITEM_BG } },
      ],
    },
    {
      key: "incidents",
      icon: <WarningOutlined />,
      label: t.incidents,
      style: { backgroundColor: SECTION_ITEM_BG.incidents ?? DEFAULT_ITEM_BG },
      children: [
        { key: "/incidents", icon: <WarningOutlined />, label: t.incidentsList, path: "/incidents", style: { backgroundColor: SUB_ITEM_BG } },
        ...((isAdmin() || isEducator()) ? [{ key: "/incidents/create", icon: <UserAddOutlined />, label: t.reportIncident, path: "/incidents/create", style: { backgroundColor: SUB_ITEM_BG } }] : []),
      ],
    },
    {
      key: "calendar",
      icon: <CalendarOutlined />,
      label: t.calendar,
      style: { backgroundColor: SECTION_ITEM_BG.calendar ?? DEFAULT_ITEM_BG },
      children: [
        { key: "/calendar", icon: <CalendarOutlined />, label: t.calendarView, path: "/calendar", style: { backgroundColor: SUB_ITEM_BG } },
        ...((isAdmin() || isEducator()) ? [{ key: "/calendar/create", icon: <UserAddOutlined />, label: t.createEvent, path: "/calendar/create", style: { backgroundColor: SUB_ITEM_BG } }] : []),
      ],
    },
    {
      key: "documents",
      icon: <BookOutlined />,
      label: t.documents,
      style: { backgroundColor: SECTION_ITEM_BG.documents ?? DEFAULT_ITEM_BG },
      children: [
        { key: "/documents", icon: <BookOutlined />, label: t.documentsList, path: "/documents", style: { backgroundColor: SUB_ITEM_BG } },
        ...((isAdmin() || isEducator()) ? [{ key: "/documents/create", icon: <UserAddOutlined />, label: t.uploadDocument, path: "/documents/create", style: { backgroundColor: SUB_ITEM_BG } }] : []),
      ],
    },
    ...(isAdmin() ? [{
      key: "reports",
      icon: <BarChartOutlined />,
      label: t.reports,
      style: { backgroundColor: SECTION_ITEM_BG.reports ?? DEFAULT_ITEM_BG },
      children: [
        { key: "/reports", icon: <BarChartOutlined />, label: t.reportsView, path: "/reports", style: { backgroundColor: SUB_ITEM_BG } },
      ],
    }] : []),
    {
      key: "language",
      icon: <GlobalOutlined />,
      label: t.language,
      style: { backgroundColor: SECTION_ITEM_BG.language ?? DEFAULT_ITEM_BG },
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "language") {
      setLanguageModalOpen(true);
      return;
    }

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

  const handleLanguageToggle = (checked: boolean) => {
    setLanguage(checked ? "spanish" : "english");
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
    <>
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      style={{
        background: colors.gradients.background,
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
          background: "transparent",
          color: colors.text.primary,
          textAlign: "center"
        }}>
          <img 
            src="/logo.png" 
            alt={t.logoAlt}
            style={{ 
              width: collapsed ? "40px" : "150px",
              height: "auto",
              marginBottom: collapsed ? "0" : "2px",
              objectFit: "contain",
              display: "block",
              margin: collapsed ? "0 auto" : "0 auto 8px"
            }}
          />
          {!collapsed && (
            <>
              <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px", color: colors.secondary.light }}>
                {t.appName}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                {t.managementSystem}
              </div>
            </>
          )}
        </div>

        {/* User Info */}
        <div style={{
          padding: "16px",
          borderBottom: `1px solid ${colors.border.light}`,
          background: colors.background.primary,
        }}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Space>
                <Avatar
                  size={collapsed ? "small" : "default"}
                  icon={<UserOutlined />}
                  style={{ 
                    backgroundColor: colors.accent.main,
                    color: "white",
                    boxShadow: colors.shadows.md
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
                    color: colors.accent.main,
                    fontWeight: 500
                  }}>
                    {getUserRoleLabel()}
                  </div>
                </div>
              )}
            </Space>
            
          </Space>
        </div>

        {/* Menu: items con colores por sección (como app móvil), sub-items fondo blanco uniforme */}
        <div style={{ 
          flex: 1, 
          overflowY: "auto",
          padding: "8px 0"
        }} className="enhanced-sidebar-menu">
          <style>{`
            .enhanced-sidebar-menu .ant-menu-sub .ant-menu-item,
            .enhanced-sidebar-menu .ant-menu-sub .ant-menu-item:hover {
              background: ${SUB_ITEM_BG} !important;
            }
            .enhanced-sidebar-menu .ant-menu-sub .ant-menu-item-selected {
              background: ${colors.background.secondary} !important;
            }
          `}</style>
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
          background: colors.background.primary,
        }}>
          {!collapsed && (
            <div style={{ 
              textAlign: "center",
              marginBottom: "12px"
            }}>
              <Text type="secondary" style={{ fontSize: "11px" }}>
                {t.version}
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
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.background.secondary;
              e.currentTarget.style.color = colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.text.secondary;
            }}
          >
            {!collapsed && t.logOut}
          </Button>
        </div>
      </div>
    </Sider>

    <Modal
      title={t.selectLanguage}
      open={languageModalOpen}
      onCancel={() => setLanguageModalOpen(false)}
      footer={null}
	    >
	      <Space direction="vertical" style={{ width: "100%" }} size="middle">
	        <Space style={{ width: "100%", justifyContent: "space-between" }}>
	          <Text>English</Text>
	          <Switch
	            checked={language === "spanish"}
	            checkedChildren="ES"
	            unCheckedChildren="EN"
	            onChange={handleLanguageToggle}
	          />
	          <Text>Español</Text>
	        </Space>
	      </Space>
	    </Modal>
    </>
  );
};

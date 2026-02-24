import React, { useEffect } from "react";
import { useList } from "@refinedev/core";
import { Card, Row, Col, Typography, Statistic, Space, Avatar, List as AntList } from "antd";
import { 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined 
} from "@ant-design/icons";
import moment from "moment";
import { useAttendanceStats, useTodayAttendance } from "../domains/attendance";
import { useLanguage } from "../shared/contexts/language.context";

const { Title, Text } = Typography;

const DASHBOARD_TRANSLATIONS = {
  english: {
    documentTitle: "Dashboard | The Children's World",
    title: "Welcome to The Children's World 🏫",
    systemSummary: "System Summary",
    totalChildren: "Total Children",
    active: "active",
    systemUsers: "System Users",
    registeredInSystem: "Registered in the system",
    todaysAttendance: "Today's Attendance",
    checkIns: "check-ins",
    checkOuts: "check-outs",
    paymentAlerts: "Payment Alerts",
    requiresAttention: "Requires attention",
    allUpToDate: "All up to date",
    absentToday: "Absent Today",
    attendanceRate: "attendance rate",
    checkIn: "Check-in",
    checkOut: "Check-out",
    checkInsLabel: "Check-ins",
    checkInsRecorded: "Check-ins recorded",
    checkOutsLabel: "Check-outs",
    checkOutsRecorded: "Check-outs recorded",
    attendanceRateLabel: "Attendance Rate",
    today: "Today",
    todaysActivity: "Today's Activity",
    records: "records",
    noAttendanceRecords: "No attendance records today",
    andMore: "And",
    more: "more...",
    paymentAlertsTitle: "Payment Alerts",
    alerts: "alerts",
    pendingPayments: "Pending payments",
    noPaymentAlerts: "No active payment alerts",
    quickAccess: "Quick Access",
    registerAttendance: "Register Attendance",
    newChild: "New Child",
    reportIncident: "Report Incident",
    newUser: "New User",
  },
  spanish: {
    documentTitle: "Panel | The Children's World",
    title: "Bienvenido a The Children's World 🏫",
    systemSummary: "Resumen del sistema",
    totalChildren: "Total de niños",
    active: "activos",
    systemUsers: "Usuarios del sistema",
    registeredInSystem: "Registrados en el sistema",
    todaysAttendance: "Asistencia de hoy",
    checkIns: "entradas",
    checkOuts: "salidas",
    paymentAlerts: "Alertas de pago",
    requiresAttention: "Requiere atención",
    allUpToDate: "Todo al día",
    absentToday: "Ausentes hoy",
    attendanceRate: "tasa de asistencia",
    checkIn: "Entrada",
    checkOut: "Salida",
    checkInsLabel: "Entradas",
    checkInsRecorded: "Entradas registradas",
    checkOutsLabel: "Salidas",
    checkOutsRecorded: "Salidas registradas",
    attendanceRateLabel: "Tasa de asistencia",
    today: "Hoy",
    todaysActivity: "Actividad de hoy",
    records: "registros",
    noAttendanceRecords: "No hay registros de asistencia hoy",
    andMore: "Y",
    more: "más...",
    paymentAlertsTitle: "Alertas de pago",
    alerts: "alertas",
    pendingPayments: "Pagos pendientes",
    noPaymentAlerts: "No hay alertas de pago activas",
    quickAccess: "Acceso rápido",
    registerAttendance: "Registrar asistencia",
    newChild: "Nuevo niño",
    reportIncident: "Reportar incidente",
    newUser: "Nuevo usuario",
  },
} as const;

interface DashboardStats {
  totalChildren: number;
  activeChildren: number;
  totalUsers: number;
  todayAttendance: number;
  paymentAlerts: number;
}

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  hasPaymentAlert: boolean;
}

interface AttendanceRecord {
  id: number;
  child: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  checkInTime?: string;
  checkOutTime?: string;
}

export const Dashboard: React.FC = () => {
  const { language } = useLanguage();
  const t = DASHBOARD_TRANSLATIONS[language];

  useEffect(() => {
    document.title = t.documentTitle;
  }, [t.documentTitle]);

  // Get basic stats - using maximum allowed pageSize of 150
  const childrenQuery = useList({
    resource: "children",
    pagination: { pageSize: 150 },
  });

  const usersQuery = useList({
    resource: "users",
    pagination: { pageSize: 150 },
  });

  // Get attendance stats and today's attendance
  const { data: attendanceStats, isLoading: loadingStats } = useAttendanceStats();
  const { data: todayAttendance, isLoading: loadingAttendance } = useTodayAttendance();

  const children = childrenQuery.result?.data || [];
  const users = usersQuery.result?.data || [];
  const attendanceRecords = todayAttendance || [];
  
  // Debug logs for payment alerts
  
  if (children.length > 0) {
    children.forEach((child: any, index: number) => {
    });
  }
  
  // Filter children with payment alerts on the frontend since API doesn't support this filter
  const paymentAlerts = children.filter((child: any) => {
    // Handle different possible values: true, 1, "1", "true"
    // MySQL tinyint(1) fields are often returned as 0/1 instead of boolean
    const hasAlert = child.hasPaymentAlert === true || 
                     child.hasPaymentAlert === 1 || 
                     child.hasPaymentAlert === "1" || 
                     child.hasPaymentAlert === "true";
    return hasAlert;
  });
  

  const stats = {
    totalChildren: attendanceStats?.totalChildren || children.length,
    activeChildren: children.filter((child: any) => child.isActive).length,
    totalUsers: users.length,
    todayAttendance: attendanceStats?.presentToday || attendanceRecords.length,
    paymentAlerts: paymentAlerts.length,
    attendanceRate: attendanceStats?.attendanceRate || 0,
    absentToday: attendanceStats?.absentToday || 0,
  };

  const checkedIn = attendanceStats?.checkedIn || attendanceRecords.filter((record: any) => record.checkInTime).length;
  const checkedOut = attendanceStats?.checkedOut || attendanceRecords.filter((record: any) => record.checkOutTime).length;

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>
        {t.title}
      </Title>
      <Text type="secondary">
        {t.systemSummary} - {moment().format("dddd, MMMM DD, YYYY")}
      </Text>

      {/* Main Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title={t.totalChildren}
              value={stats.totalChildren}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <Text type="secondary">
              {stats.activeChildren} {t.active}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title={t.systemUsers}
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Text type="secondary">
              {t.registeredInSystem}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title={t.todaysAttendance}
              value={stats.todayAttendance}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
            <Text type="secondary">
              {checkedIn} {t.checkIns}, {checkedOut} {t.checkOuts}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title={t.paymentAlerts}
              value={stats.paymentAlerts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: stats.paymentAlerts > 0 ? "#ff4d4f" : "#52c41a" }}
            />
            <Text type="secondary">
              {stats.paymentAlerts > 0 ? t.requiresAttention : t.allUpToDate}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Additional Attendance Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title={t.absentToday}
              value={stats.absentToday}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
            <Text type="secondary">
              {stats.attendanceRate}% {t.attendanceRate}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title={t.checkInsLabel}
              value={checkedIn}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Text type="secondary">
              {t.checkInsRecorded}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title={t.checkOutsLabel}
              value={checkedOut}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <Text type="secondary">
              {t.checkOutsRecorded}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title={t.attendanceRateLabel}
              value={stats.attendanceRate}
              suffix="%"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: stats.attendanceRate >= 80 ? "#52c41a" : stats.attendanceRate >= 60 ? "#faad14" : "#ff4d4f" }}
            />
            <Text type="secondary">
              {t.today}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Today's Activity */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                {t.todaysActivity}
              </Space>
            }
            extra={<Text type="secondary">{attendanceRecords.length} {t.records}</Text>}
          >
            <AntList
              dataSource={attendanceRecords.slice(0, 5)}
              renderItem={(record: any) => (
                <AntList.Item>
                  <AntList.Item.Meta
                    avatar={
                      <Avatar
                        src={record.child.profilePicture}
                        icon={<UserOutlined />}
                      />
                    }
                    title={`${record.child.firstName} ${record.child.lastName}`}
                    description={
                      <Space>
                        {record.checkInTime && (
                          <Text type="success">
                            <CheckCircleOutlined /> {t.checkIn}: {moment(record.checkInTime, "HH:mm:ss").format("HH:mm")}
                          </Text>
                        )}
                        {record.checkOutTime && (
                          <Text type="warning">
                            <ClockCircleOutlined /> {t.checkOut}: {moment(record.checkOutTime, "HH:mm:ss").format("HH:mm")}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </AntList.Item>
              )}
              locale={{ emptyText: t.noAttendanceRecords }}
            />
            {attendanceRecords.length > 5 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text type="secondary">
                  {t.andMore} {attendanceRecords.length - 5} {t.more}
                </Text>
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: "#ff4d4f" }} />
                {t.paymentAlertsTitle}
              </Space>
            }
            extra={<Text type="secondary">{paymentAlerts.length} {t.alerts}</Text>}
          >
            <AntList
              dataSource={paymentAlerts.slice(0, 5)}
              renderItem={(child: any) => (
                <AntList.Item>
                  <AntList.Item.Meta
                    avatar={
                      <Avatar
                        src={child.profilePicture}
                        icon={<UserOutlined />}
                      />
                    }
                    title={`${child.firstName} ${child.lastName}`}
                    description={
                      <Text type="danger">
                        <WarningOutlined /> {t.pendingPayments}
                      </Text>
                    }
                  />
                </AntList.Item>
              )}
              locale={{ emptyText: t.noPaymentAlerts }}
            />
            {paymentAlerts.length > 5 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text type="secondary">
                  {t.andMore} {paymentAlerts.length - 5} {t.more}
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title={t.quickAccess}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/attendance/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }} />
                  <div>{t.registerAttendance}</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/children/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <TeamOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }} />
                  <div>{t.newChild}</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/incidents/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <WarningOutlined style={{ fontSize: 32, color: "#faad14", marginBottom: 8 }} />
                  <div>{t.reportIncident}</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/users/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <UserOutlined style={{ fontSize: 32, color: "#722ed1", marginBottom: 8 }} />
                  <div>{t.newUser}</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

import React from "react";
import { useCustom, useList } from "@refinedev/core";
import { Card, Row, Col, Typography, Statistic, Space, Avatar, List as AntList } from "antd";
import { 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined 
} from "@ant-design/icons";
import moment from "moment";
import { axiosInstance } from "../shared";

const { Title, Text } = Typography;

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
  // Get basic stats - using maximum allowed pageSize of 150
  const childrenQuery = useList({
    resource: "children",
    pagination: { pageSize: 150 },
  });

  const usersQuery = useList({
    resource: "users",
    pagination: { pageSize: 150 },
  });

  // Get today's attendance
  const attendanceQuery = useCustom({
    url: "/attendance/today",
    method: "get",
  });

  const children = childrenQuery.result?.data || [];
  const users = usersQuery.result?.data || [];
  const attendanceRecords = (attendanceQuery as any)?.data || [];
  
  // Filter children with payment alerts on the frontend since API doesn't support this filter
  const paymentAlerts = children.filter((child: any) => child.hasPaymentAlert === true);

  const stats = {
    totalChildren: children.length,
    activeChildren: children.filter((child: any) => child.isActive).length,
    totalUsers: users.length,
    todayAttendance: attendanceRecords.length,
    paymentAlerts: paymentAlerts.length,
  };

  const checkedIn = attendanceRecords.filter((record: AttendanceRecord) => record.checkInTime).length;
  const checkedOut = attendanceRecords.filter((record: AttendanceRecord) => record.checkOutTime).length;

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>
        Bienvenido a The Children's World 🏫
      </Title>
      <Text type="secondary">
        Resumen del sistema - {moment().format("dddd, DD [de] MMMM [de] YYYY")}
      </Text>

      {/* Main Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Total de Niños"
              value={stats.totalChildren}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <Text type="secondary">
              {stats.activeChildren} activos
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Usuarios del Sistema"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Text type="secondary">
              Registrados en el sistema
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Asistencia Hoy"
              value={stats.todayAttendance}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
            <Text type="secondary">
              {checkedIn} entradas, {checkedOut} salidas
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Alertas de Pago"
              value={stats.paymentAlerts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: stats.paymentAlerts > 0 ? "#ff4d4f" : "#52c41a" }}
            />
            <Text type="secondary">
              {stats.paymentAlerts > 0 ? "Requieren atención" : "Todo al día"}
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
                Actividad de Hoy
              </Space>
            }
            extra={<Text type="secondary">{attendanceRecords.length} registros</Text>}
          >
            <AntList
              dataSource={attendanceRecords.slice(0, 5)}
              renderItem={(record: AttendanceRecord) => (
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
                            <CheckCircleOutlined /> Entrada: {moment(record.checkInTime, "HH:mm:ss").format("HH:mm")}
                          </Text>
                        )}
                        {record.checkOutTime && (
                          <Text type="warning">
                            <ClockCircleOutlined /> Salida: {moment(record.checkOutTime, "HH:mm:ss").format("HH:mm")}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </AntList.Item>
              )}
              locale={{ emptyText: "No hay registros de asistencia hoy" }}
            />
            {attendanceRecords.length > 5 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text type="secondary">
                  Y {attendanceRecords.length - 5} más...
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
                Alertas de Pago
              </Space>
            }
            extra={<Text type="secondary">{paymentAlerts.length} alertas</Text>}
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
                        <WarningOutlined /> Pagos pendientes
                      </Text>
                    }
                  />
                </AntList.Item>
              )}
              locale={{ emptyText: "No hay alertas de pago activas" }}
            />
            {paymentAlerts.length > 5 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text type="secondary">
                  Y {paymentAlerts.length - 5} más...
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Accesos Rápidos">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/attendance/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }} />
                  <div>Registrar Asistencia</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/children/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <TeamOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }} />
                  <div>Nuevo Niño</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/incidents/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <WarningOutlined style={{ fontSize: 32, color: "#faad14", marginBottom: 8 }} />
                  <div>Reportar Incidente</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/users/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <UserOutlined style={{ fontSize: 32, color: "#722ed1", marginBottom: 8 }} />
                  <div>Nuevo Usuario</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

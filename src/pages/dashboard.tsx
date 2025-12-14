import React, { useEffect } from "react";
import { useCustom, useList } from "@refinedev/core";
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
import { axiosInstance } from "../shared";
import { useAttendanceStats, useTodayAttendance } from "../domains/attendance";

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
  useEffect(() => {
    document.title = "Dashboard | The Children's World";
  }, []);

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
  console.log("🔍 Dashboard - children data:", children);
  console.log("🔍 Dashboard - children length:", children.length);
  
  if (children.length > 0) {
    children.forEach((child: any, index: number) => {
      console.log(`🔍 Dashboard - child ${index}:`, {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        hasPaymentAlert: child.hasPaymentAlert,
        hasPaymentAlertType: typeof child.hasPaymentAlert,
        hasPaymentAlertValue: child.hasPaymentAlert
      });
    });
  }
  
  // Filter children with payment alerts on the frontend since API doesn't support this filter
  const paymentAlerts = children.filter((child: any) => {
    console.log(`🔍 Dashboard - filtering child ${child.id}: hasPaymentAlert = ${child.hasPaymentAlert} (${typeof child.hasPaymentAlert})`);
    // Handle different possible values: true, 1, "1", "true"
    // MySQL tinyint(1) fields are often returned as 0/1 instead of boolean
    const hasAlert = child.hasPaymentAlert === true || 
                     child.hasPaymentAlert === 1 || 
                     child.hasPaymentAlert === "1" || 
                     child.hasPaymentAlert === "true";
    console.log(`🔍 Dashboard - child ${child.id} hasAlert result: ${hasAlert}`);
    return hasAlert;
  });
  
  console.log("🔍 Dashboard - paymentAlerts filtered:", paymentAlerts);
  console.log("🔍 Dashboard - paymentAlerts length:", paymentAlerts.length);

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
        Welcome to The Children's World 🏫
      </Title>
      <Text type="secondary">
        System Summary - {moment().format("dddd, MMMM DD, YYYY")}
      </Text>

      {/* Main Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Total Children"
              value={stats.totalChildren}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <Text type="secondary">
              {stats.activeChildren} active
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="System Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Text type="secondary">
              Registered in the system
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Today's Attendance"
              value={stats.todayAttendance}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
            <Text type="secondary">
              {checkedIn} check-ins, {checkedOut} check-outs
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Payment Alerts"
              value={stats.paymentAlerts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: stats.paymentAlerts > 0 ? "#ff4d4f" : "#52c41a" }}
            />
            <Text type="secondary">
              {stats.paymentAlerts > 0 ? "Requires attention" : "All up to date"}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Additional Attendance Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Absent Today"
              value={stats.absentToday}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
            <Text type="secondary">
              {stats.attendanceRate}% attendance rate
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Check-ins"
              value={checkedIn}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Text type="secondary">
              Check-ins recorded
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Check-outs"
              value={checkedOut}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <Text type="secondary">
              Check-outs recorded
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Statistic
              title="Attendance Rate"
              value={stats.attendanceRate}
              suffix="%"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: stats.attendanceRate >= 80 ? "#52c41a" : stats.attendanceRate >= 60 ? "#faad14" : "#ff4d4f" }}
            />
            <Text type="secondary">
              Hoy
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
                Today's Activity
              </Space>
            }
            extra={<Text type="secondary">{attendanceRecords.length} records</Text>}
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
                            <CheckCircleOutlined /> Check-in: {moment(record.checkInTime, "HH:mm:ss").format("HH:mm")}
                          </Text>
                        )}
                        {record.checkOutTime && (
                          <Text type="warning">
                            <ClockCircleOutlined /> Check-out: {moment(record.checkOutTime, "HH:mm:ss").format("HH:mm")}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </AntList.Item>
              )}
              locale={{ emptyText: "No attendance records today" }}
            />
            {attendanceRecords.length > 5 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text type="secondary">
                  And {attendanceRecords.length - 5} more...
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
                Payment Alerts
              </Space>
            }
            extra={<Text type="secondary">{paymentAlerts.length} alerts</Text>}
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
                        <WarningOutlined /> Pending payments
                      </Text>
                    }
                  />
                </AntList.Item>
              )}
              locale={{ emptyText: "No active payment alerts" }}
            />
            {paymentAlerts.length > 5 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text type="secondary">
                  And {paymentAlerts.length - 5} more...
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Quick Access">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/attendance/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }} />
                  <div>Register Attendance</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/children/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <TeamOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }} />
                  <div>New Child</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/incidents/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <WarningOutlined style={{ fontSize: 32, color: "#faad14", marginBottom: 8 }} />
                  <div>Report Incident</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  onClick={() => window.location.href = "/users/create"}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <UserOutlined style={{ fontSize: 32, color: "#722ed1", marginBottom: 8 }} />
                  <div>New User</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

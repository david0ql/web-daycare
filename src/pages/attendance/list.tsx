import React from "react";
import { List, useTable, DateField, BooleanField, TextField, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag, Typography, Card, Row, Col, Statistic, Avatar, Tooltip } from "antd";
import { 
  useTodayAttendance, 
  useChildrenWithStatus, 
  useAttendanceStats,
  ChildWithStatus,
  AttendanceStatus
} from "../../domains/attendance";
import { CheckCircleOutlined, ClockCircleOutlined, UserOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AttendanceStatusComponent: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  // Determine presence based on check-in/check-out times, not isPresent field
  const hasCheckIn = !!status.isCheckedIn;
  const hasCheckOut = !!status.isCheckedOut;
  
  // If no check-in time, consider absent
  if (!hasCheckIn) {
    return (
      <Tag color="red" icon={<CloseCircleOutlined />}>
        Absent
      </Tag>
    );
  }

  // If has check-out, show as "Salida" (checked out)
  if (hasCheckOut) {
    return (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        Checked Out
      </Tag>
    );
  }

  // If has check-in but no check-out, show as "Presente"
  return (
    <Tag color="blue" icon={<ClockCircleOutlined />}>
        Present
    </Tag>
  );
};

export const AttendanceList: React.FC = () => {
  const { tableProps } = useTable();
  const { data: todayAttendance, isLoading: loadingAttendance } = useTodayAttendance();
  const { data: childrenWithStatus, isLoading: loadingChildren } = useChildrenWithStatus();
  const { data: stats, isLoading: loadingStats } = useAttendanceStats();

  // Debug logs
  console.log("🔍 Attendance List - tableProps:", tableProps);
  console.log("🔍 Attendance List - tableProps.dataSource:", tableProps.dataSource);
  console.log("🔍 Attendance List - stats:", stats);
  

  const columns = [
    {
      title: "Child",
      dataIndex: ["child", "firstName"],
      key: "child",
      render: (_: any, record: any) => (
        <Space>
          <Avatar 
            src={record.child?.profilePicture} 
            icon={<UserOutlined />}
            size="small"
          />
          <div>
            <div>{record.child?.firstName} {record.child?.lastName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record.childId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "attendanceDate",
      key: "attendanceDate",
      render: (value: string) => <DateField value={value} format="DD/MM/YYYY" />,
    },
    {
      title: "Check-in",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (value: string) => value ? (
        <Text>{new Date(value).toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}</Text>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: "Check-out",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      render: (value: string) => value ? (
        <Text>{new Date(value).toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}</Text>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: "Status",
      dataIndex: "isPresent",
      key: "isPresent",
      render: (_: any, record: any) => {
        const status: AttendanceStatus = {
          isPresent: record.isPresent,
          isCheckedIn: !!record.checkInTime,
          isCheckedOut: !!record.checkOutTime,
          attendance: record
        };
        return <AttendanceStatusComponent status={status} />;
      },
    },
    {
      title: "Delivered by",
      dataIndex: ["deliveredBy2", "name"],
      key: "deliveredBy",
      render: (value: string, record: any) => value ? (
        <Tooltip title={`${record.deliveredBy2?.relationship} - ${record.deliveredBy2?.phone}`}>
          <Text>{value}</Text>
        </Tooltip>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: "Picked up by",
      dataIndex: ["pickedUpBy2", "name"],
      key: "pickedUpBy",
      render: (value: string, record: any) => value ? (
        <Tooltip title={`${record.pickedUpBy2?.relationship} - ${record.pickedUpBy2?.phone}`}>
          <Text>{value}</Text>
        </Tooltip>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: "Notes",
      key: "notes",
      render: (_: any, record: any) => {
        const checkInNotes = record.checkInNotes || 'N/A';
        const checkOutNotes = record.checkOutNotes || 'N/A';
        const notesText = `Check-in: ${checkInNotes} / Check-out: ${checkOutNotes}`;
        
        return (
          <Tooltip title={notesText}>
            <Text ellipsis style={{ maxWidth: 150 }}>
              {notesText}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => {
        console.log("🔍 Attendance List - record for actions:", record);
        console.log("🔍 Attendance List - record.id:", record.id);
        return (
          <Space>
            <EditButton 
              hideText 
              size="small" 
              recordItemId={record.id}
            />
            <DeleteButton hideText size="small" recordItemId={record.id} />
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Children"
              value={stats?.totalChildren || 0}
              loading={loadingStats}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Present Today"
              value={stats?.presentToday || 0}
              loading={loadingStats}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Absent Today"
              value={stats?.absentToday || 0}
              loading={loadingStats}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Attendance Rate"
              value={stats?.attendanceRate || 0}
              loading={loadingStats}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      {/* Attendance List */}
      <List title="Attendance Record">
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          loading={loadingAttendance}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} records`,
          }}
        />
      </List>
    </div>
  );
};
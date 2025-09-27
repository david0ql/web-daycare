import React, { useState } from "react";
import { useList, usePermissions, useCustom } from "@refinedev/core";
import { List, useTable, TagField } from "@refinedev/antd";
import { Table, Space, Avatar, Typography, Button, Card, Row, Col, DatePicker, Select } from "antd";
import { UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface AttendanceRecord {
  id: number;
  child: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  deliveredBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  pickedUpBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  checkInNotes?: string;
  checkOutNotes?: string;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export const AttendanceList: React.FC = () => {
  const { data: permissions } = usePermissions({});
  const canManage = permissions === "administrator" || permissions === "educator";

  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  // Get today's attendance for quick view
  const { data: todayAttendance } = useCustom({
    url: "http://localhost:30000/api/attendance/today",
    method: "get",
  });

  // Get children for filter
  const { data: childrenData } = useList({
    resource: "children",
    pagination: { pageSize: 150 },
  });

  const { tableProps } = useTable<AttendanceRecord>({
    syncWithLocation: false,
    sorters: {
      initial: [
        {
          field: "date",
          order: "desc",
        },
      ],
    },
    filters: {
      permanent: [
        ...(dateRange
          ? [
              {
                field: "date",
                operator: "gte" as const,
                value: dateRange[0].format("YYYY-MM-DD"),
              },
              {
                field: "date",
                operator: "lte" as const,
                value: dateRange[1].format("YYYY-MM-DD"),
              },
            ]
          : []),
        ...(selectedChild
          ? [
              {
                field: "childId",
                operator: "eq" as const,
                value: selectedChild,
              },
            ]
          : []),
      ],
    },
  });

  const getStatusColor = (record: AttendanceRecord) => {
    if (record.checkInTime && record.checkOutTime) return "green";
    if (record.checkInTime && !record.checkOutTime) return "orange";
    return "red";
  };

  const getStatusText = (record: AttendanceRecord) => {
    if (record.checkInTime && record.checkOutTime) return "Completo";
    if (record.checkInTime && !record.checkOutTime) return "Presente";
    return "Ausente";
  };

  const todayStats = todayAttendance?.data || [];
  const totalToday = todayStats.length;
  const checkedIn = todayStats.filter((record: AttendanceRecord) => record.checkInTime).length;
  const checkedOut = todayStats.filter((record: AttendanceRecord) => record.checkOutTime).length;

  return (
    <div>
      {/* Today's Summary */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                {totalToday}
              </Title>
              <Text>Registros Hoy</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                {checkedIn}
              </Title>
              <Text>Check-ins</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#faad14" }}>
                {checkedOut}
              </Title>
              <Text>Check-outs</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <List
        headerButtons={
          canManage ? (
            <Space>
              <Button type="primary" href="/attendance/create">
                Nuevo Check-in
              </Button>
            </Space>
          ) : undefined
        }
      >
        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Rango de Fechas:</Text>
              <RangePicker
                style={{ width: "100%", marginTop: 8 }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [moment.Moment, moment.Moment])}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col span={12}>
              <Text strong>Filtrar por Niño:</Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="Seleccione un niño"
                allowClear
                value={selectedChild}
                onChange={setSelectedChild}
                options={childrenData?.data?.map((child: any) => ({
                  label: `${child.firstName} ${child.lastName}`,
                  value: child.id,
                }))}
              />
            </Col>
          </Row>
        </Card>

        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex={["child", "profilePicture"]}
            title="Niño"
            render={(value, record: AttendanceRecord) => (
              <Space>
                <Avatar
                  src={value}
                  icon={<UserOutlined />}
                  alt={`${record.child.firstName} ${record.child.lastName}`}
                />
                <div>
                  <Text strong>{`${record.child.firstName} ${record.child.lastName}`}</Text>
                </div>
              </Space>
            )}
          />
          <Table.Column
            dataIndex="date"
            title="Fecha"
            render={(value) => moment(value).format("DD/MM/YYYY")}
          />
          <Table.Column
            dataIndex="checkInTime"
            title="Hora de Entrada"
            render={(value) => (
              <Space>
                <ClockCircleOutlined style={{ color: value ? "#52c41a" : "#d9d9d9" }} />
                {value ? moment(value, "HH:mm:ss").format("HH:mm") : "No registrado"}
              </Space>
            )}
          />
          <Table.Column
            dataIndex="checkOutTime"
            title="Hora de Salida"
            render={(value) => (
              <Space>
                <CheckCircleOutlined style={{ color: value ? "#52c41a" : "#d9d9d9" }} />
                {value ? moment(value, "HH:mm:ss").format("HH:mm") : "No registrado"}
              </Space>
            )}
          />
          <Table.Column
            dataIndex={["deliveredBy", "firstName"]}
            title="Entregado por"
            render={(value, record: AttendanceRecord) =>
              record.deliveredBy
                ? `${record.deliveredBy.firstName} ${record.deliveredBy.lastName}`
                : "No especificado"
            }
          />
          <Table.Column
            dataIndex={["pickedUpBy", "firstName"]}
            title="Recogido por"
            render={(value, record: AttendanceRecord) =>
              record.pickedUpBy
                ? `${record.pickedUpBy.firstName} ${record.pickedUpBy.lastName}`
                : "No registrado"
            }
          />
          <Table.Column
            title="Estado"
            render={(record: AttendanceRecord) => (
              <TagField
                value={getStatusText(record)}
                color={getStatusColor(record)}
              />
            )}
          />
          <Table.Column
            dataIndex={["createdBy", "firstName"]}
            title="Registrado por"
            render={(value, record: AttendanceRecord) =>
              `${record.createdBy.firstName} ${record.createdBy.lastName}`
            }
          />
        </Table>
      </List>
    </div>
  );
};

import React from "react";
import { List, useTable, DateField, TextField, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Avatar, Tooltip, Tag, Space, Button, Card, Typography } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_ICONS } from "../../domains/attendance/types/daily-activities.types";
import { useNavigate } from "react-router";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const AttendanceActivities: React.FC = () => {
  const navigate = useNavigate();
  const today = dayjs().format('YYYY-MM-DD');
  const { tableProps } = useTable({
    resource: "attendance/daily-activities",
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
    filters: {
      initial: [
        {
          field: "attendance.attendanceDate",
          operator: "eq",
          value: today,
        },
      ],
    },
  });

  const getActivityStatus = (record: any) => {
    if (record.completed) {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Completada
        </Tag>
      );
    }
    return (
      <Tag color="orange" icon={<ClockCircleOutlined />}>
        Pendiente
      </Tag>
    );
  };

  const getTimeCompleted = (record: any) => {
    if (record.completed && record.timeCompleted) {
      return dayjs(record.timeCompleted).format('HH:mm');
    }
    return null;
  };

  return (
    <List
      title="Actividades Diarias"
      headerButtons={[
        <Button 
          type="primary" 
          key="create"
          icon={<PlusOutlined />}
          onClick={() => navigate('/attendance/activities/create')}
        >
          Registrar Actividad
        </Button>,
      ]}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="child"
          title="Niño"
          render={(child: any) => (
            <Space>
              <Avatar 
                src={child?.profilePicture} 
                size="small"
              >
                {child?.firstName?.[0]}{child?.lastName?.[0]}
              </Avatar>
              <Text strong>{child?.firstName} {child?.lastName}</Text>
            </Space>
          )}
        />
        <Table.Column
          dataIndex="activityType"
          title="Actividad"
          render={(activityType: string) => (
            <Space>
              <span style={{ fontSize: '16px' }}>
                {ACTIVITY_TYPE_ICONS[activityType as keyof typeof ACTIVITY_TYPE_ICONS]}
              </span>
              {ACTIVITY_TYPE_LABELS[activityType as keyof typeof ACTIVITY_TYPE_LABELS]}
            </Space>
          )}
        />
        <Table.Column
          dataIndex="completed"
          title="Estado"
          render={(_, record: any) => getActivityStatus(record)}
        />
        <Table.Column
          dataIndex="timeCompleted"
          title="Hora Completado"
          render={(_, record: any) => getTimeCompleted(record)}
        />
        <Table.Column
          dataIndex="attendance"
          title="Fecha"
          render={(attendance: any) => (
            <DateField value={attendance?.attendanceDate} format="DD/MM/YYYY" />
          )}
        />
        <Table.Column
          dataIndex="notes"
          title="Notas"
          render={(notes: string) => (
            <Tooltip title={notes}>
              <Text ellipsis style={{ maxWidth: 200 }}>
                {notes || '-'}
              </Text>
            </Tooltip>
          )}
        />
        <Table.Column
          dataIndex="createdBy2"
          title="Registrado por"
          render={(user: any) => (
            <Text type="secondary">
              {user?.firstName} {user?.lastName}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Creado"
          render={(value: string) => (
            <DateField value={value} format="DD/MM/YYYY HH:mm" />
          )}
        />
        <Table.Column
          title="Acciones"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

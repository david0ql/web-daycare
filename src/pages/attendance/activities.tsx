import React from "react";
import { List, useTable, DateField, TextField, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Avatar, Tooltip, Tag, Space, Button, Card, Typography } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { ACTIVITY_TYPE_LABELS_BY_LANGUAGE, ACTIVITY_TYPE_ICONS } from "../../domains/attendance/types/daily-activities.types";
import { useNavigate } from "react-router";
import dayjs from 'dayjs';
import { useLanguage } from "../../shared/contexts/language.context";

const { Title, Text } = Typography;

const ATTENDANCE_ACTIVITIES_TRANSLATIONS = {
  english: {
    title: "Daily Activities",
    registerActivity: "Register Activity",
    child: "Child",
    activity: "Activity",
    status: "Status",
    completionTime: "Completion Time",
    date: "Date",
    notes: "Notes",
    registeredBy: "Registered by",
    created: "Created",
    actions: "Actions",
    completed: "Completed",
    pending: "Pending",
  },
  spanish: {
    title: "Actividades diarias",
    registerActivity: "Registrar actividad",
    child: "Niño",
    activity: "Actividad",
    status: "Estado",
    completionTime: "Hora de finalización",
    date: "Fecha",
    notes: "Notas",
    registeredBy: "Registrado por",
    created: "Creado",
    actions: "Acciones",
    completed: "Completada",
    pending: "Pendiente",
  },
} as const;

export const AttendanceActivities: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = ATTENDANCE_ACTIVITIES_TRANSLATIONS[language];
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
          {t.completed}
        </Tag>
      );
    }
    return (
      <Tag color="orange" icon={<ClockCircleOutlined />}>
        {t.pending}
      </Tag>
    );
  };

  const getTimeCompleted = (record: any) => {
    if (record.completed && record.timeCompleted) {
      return dayjs(record.timeCompleted).format('h:mm A');
    }
    return null;
  };

  return (
    <List
      title={t.title}
      headerButtons={[
        <Button 
          type="primary" 
          key="create"
          icon={<PlusOutlined />}
          onClick={() => navigate('/attendance/activities/create')}
        >
          {t.registerActivity}
        </Button>,
      ]}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="child"
          title={t.child}
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
          title={t.activity}
          render={(activityType: string) => (
            <Space>
              <span style={{ fontSize: '16px' }}>
                {ACTIVITY_TYPE_ICONS[activityType as keyof typeof ACTIVITY_TYPE_ICONS]}
              </span>
              {ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][activityType as keyof typeof ACTIVITY_TYPE_LABELS_BY_LANGUAGE.english]}
            </Space>
          )}
        />
        <Table.Column
          dataIndex="completed"
          title={t.status}
          render={(_, record: any) => getActivityStatus(record)}
        />
        <Table.Column
          dataIndex="timeCompleted"
          title={t.completionTime}
          render={(_, record: any) => getTimeCompleted(record)}
        />
        <Table.Column
          dataIndex="attendance"
          title={t.date}
          render={(attendance: any) => (
            <DateField
              value={attendance?.attendanceDate}
              format={language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY"}
            />
          )}
        />
        <Table.Column
          dataIndex="notes"
          title={t.notes}
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
          title={t.registeredBy}
          render={(user: any) => (
            <Text type="secondary">
              {user?.firstName} {user?.lastName}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title={t.created}
          render={(value: string) => {
            const dateFormat = language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY";
            return <Text>{dayjs(value).format(`${dateFormat} h:mm A`)}</Text>;
          }}
        />
        <Table.Column
          title={t.actions}
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

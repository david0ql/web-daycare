import React from "react";
import { List, useTable, DateField, TextField, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Avatar, Tooltip, Tag, Space, Button, Card, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { MOOD_LABELS_BY_LANGUAGE, MOOD_ICONS, MOOD_COLORS } from "../../domains/attendance/types/daily-observations.types";
import { useNavigate } from "react-router";
import dayjs from 'dayjs';
import { useLanguage } from "../../shared/contexts/language.context";

const { Title, Text } = Typography;

const ATTENDANCE_OBSERVATIONS_TRANSLATIONS = {
  english: {
    title: "Daily Observations",
    registerObservation: "Register Observation",
    child: "Child",
    mood: "Mood",
    observations: "Observations",
    date: "Date",
    registeredBy: "Registered by",
    created: "Created",
    actions: "Actions",
  },
  spanish: {
    title: "Observaciones diarias",
    registerObservation: "Registrar observación",
    child: "Niño",
    mood: "Estado de ánimo",
    observations: "Observaciones",
    date: "Fecha",
    registeredBy: "Registrado por",
    created: "Creado",
    actions: "Acciones",
  },
} as const;

export const AttendanceObservations: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = ATTENDANCE_OBSERVATIONS_TRANSLATIONS[language];
  const today = dayjs().format('YYYY-MM-DD');
  const { tableProps } = useTable({
    resource: "attendance/daily-observations",
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

  const getMoodTag = (mood: string) => {
    return (
      <Tag 
        color={MOOD_COLORS[mood as keyof typeof MOOD_COLORS]}
        icon={<span style={{ fontSize: '14px' }}>{MOOD_ICONS[mood as keyof typeof MOOD_ICONS]}</span>}
      >
        {MOOD_LABELS_BY_LANGUAGE[language][mood as keyof typeof MOOD_LABELS_BY_LANGUAGE.english]}
      </Tag>
    );
  };

  return (
    <List
      title={t.title}
      headerButtons={[
        <Button 
          type="primary" 
          key="create"
          icon={<PlusOutlined />}
          onClick={() => navigate('/attendance/observations/create')}
        >
          {t.registerObservation}
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
          dataIndex="mood"
          title={t.mood}
          render={(mood: string) => getMoodTag(mood)}
        />
        <Table.Column
          dataIndex="generalObservations"
          title={t.observations}
          render={(observations: string) => (
            <Tooltip title={observations}>
              <Text ellipsis style={{ maxWidth: 300 }}>
                {observations}
              </Text>
            </Tooltip>
          )}
        />
        <Table.Column
          dataIndex="attendance"
          title={t.date}
          render={(attendance: any) => (
            <DateField value={attendance?.attendanceDate} format="DD/MM/YYYY" />
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
          render={(value: string) => (
            <DateField value={value} format="DD/MM/YYYY HH:mm" />
          )}
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

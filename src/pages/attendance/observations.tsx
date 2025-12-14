import React from "react";
import { List, useTable, DateField, TextField, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Avatar, Tooltip, Tag, Space, Button, Card, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { MOOD_LABELS, MOOD_ICONS, MOOD_COLORS } from "../../domains/attendance/types/daily-observations.types";
import { useNavigate } from "react-router";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const AttendanceObservations: React.FC = () => {
  const navigate = useNavigate();
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
        {MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}
      </Tag>
    );
  };

  return (
    <List
      title="Daily Observations"
      headerButtons={[
        <Button 
          type="primary" 
          key="create"
          icon={<PlusOutlined />}
          onClick={() => navigate('/attendance/observations/create')}
        >
          Register Observation
        </Button>,
      ]}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="child"
          title="Child"
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
          title="Mood"
          render={(mood: string) => getMoodTag(mood)}
        />
        <Table.Column
          dataIndex="generalObservations"
          title="Observations"
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
          title="Date"
          render={(attendance: any) => (
            <DateField value={attendance?.attendanceDate} format="DD/MM/YYYY" />
          )}
        />
        <Table.Column
          dataIndex="createdBy2"
          title="Registered by"
          render={(user: any) => (
            <Text type="secondary">
              {user?.firstName} {user?.lastName}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Created"
          render={(value: string) => (
            <DateField value={value} format="DD/MM/YYYY HH:mm" />
          )}
        />
        <Table.Column
          title="Actions"
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

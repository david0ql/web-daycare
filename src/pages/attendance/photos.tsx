import React from "react";
import { List, useTable, DateField, TextField, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Avatar, Tooltip, Tag, Space, Button, Card, Typography, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const AttendancePhotos: React.FC = () => {
  const navigate = useNavigate();
  const today = dayjs().format('YYYY-MM-DD');
  const { tableProps } = useTable({
    resource: "attendance/activity-photos",
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

  const getImageUrl = (record: any) => {
    // Assuming the API serves images from a static route
    return `http://localhost:30000/uploads/activity-photos/${record.filename}`;
  };

  return (
    <List
      title="Fotos de Actividades"
      headerButtons={[
        <Button 
          type="primary" 
          key="create"
          icon={<PlusOutlined />}
          onClick={() => navigate('/attendance/photos/create')}
        >
          Subir Foto
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
          dataIndex="filename"
          title="Foto"
          render={(filename: string, record: any) => (
            <Image
              width={60}
              height={60}
              src={getImageUrl(record)}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          )}
        />
        <Table.Column
          dataIndex="caption"
          title="Descripción"
          render={(caption: string) => (
            <Tooltip title={caption}>
              <Text ellipsis style={{ maxWidth: 200 }}>
                {caption || 'Sin descripción'}
              </Text>
            </Tooltip>
          )}
        />
        <Table.Column
          dataIndex="attendance"
          title="Fecha"
          render={(attendance: any) => (
            <DateField value={attendance?.attendanceDate} format="DD/MM/YYYY" />
          )}
        />
        <Table.Column
          dataIndex="uploadedBy2"
          title="Subido por"
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

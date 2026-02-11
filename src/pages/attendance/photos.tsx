import React from "react";
import { List, useTable, DateField, TextField, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Avatar, Tooltip, Tag, Space, Button, Card, Typography, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from 'dayjs';
import { useLanguage } from "../../shared/contexts/language.context";

const { Title, Text } = Typography;

const ATTENDANCE_PHOTOS_TRANSLATIONS = {
  english: {
    title: "Activity Photos",
    uploadPhoto: "Upload Photo",
    child: "Child",
    photo: "Photo",
    description: "Description",
    noDescription: "No description",
    date: "Date",
    uploadedBy: "Uploaded by",
    created: "Created",
    actions: "Actions",
  },
  spanish: {
    title: "Fotos de actividades",
    uploadPhoto: "Subir foto",
    child: "Niño",
    photo: "Foto",
    description: "Descripción",
    noDescription: "Sin descripción",
    date: "Fecha",
    uploadedBy: "Subido por",
    created: "Creado",
    actions: "Acciones",
  },
} as const;

export const AttendancePhotos: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = ATTENDANCE_PHOTOS_TRANSLATIONS[language];
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
    // Use axiosInstance to get the image with JWT token
    const token = localStorage.getItem('refine-auth');
    return `https://api.thechildrenworld.com/api/uploads/activity-photos/${record.filename}?token=${token}`;
  };

  return (
    <List
      title={t.title}
      headerButtons={[
        <Button 
          type="primary" 
          key="create"
          icon={<PlusOutlined />}
          onClick={() => navigate('/attendance/photos/create')}
        >
          {t.uploadPhoto}
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
          dataIndex="filename"
          title={t.photo}
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
          title={t.description}
          render={(caption: string) => (
            <Tooltip title={caption}>
              <Text ellipsis style={{ maxWidth: 200 }}>
                {caption || t.noDescription}
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
          dataIndex="uploadedBy2"
          title={t.uploadedBy}
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

import React from "react";
import { List, useTable, DateField, TextField, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Avatar, Tooltip, Tag, Space, Button, Card, Typography, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
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
  const { tableProps } = useTable({
    resource: "attendance/activity-photos",
    syncWithLocation: false,
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
    pagination: {
      pageSize: 10,
    },
  });

  const getImageUrl = (record: any) => {
    if (record.filename === 'no-photo.jpg') {
      return '/no-photo.jpg';
    }
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
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            language === "spanish"
              ? `${range[0]}-${range[1]} de ${total} registros`
              : `${range[0]}-${range[1]} of ${total} records`,
        }}
      >
        <Table.Column
          dataIndex="child"
          title={t.child}
          render={(_, record: any) => {
            const childInfo = record.child;
            const profilePicture = childInfo?.profilePicture;
            const avatarSrc = profilePicture
              ? profilePicture.startsWith("http")
                ? profilePicture
                : `https://api.thechildrenworld.com/api${profilePicture}`
              : null;
            return (
              <Space>
                <Avatar 
                  src={avatarSrc} 
                  size="small"
                >
                  {childInfo?.firstName?.[0]}{childInfo?.lastName?.[0]}
                </Avatar>
                <Text strong>{childInfo?.firstName} {childInfo?.lastName}</Text>
              </Space>
            );
          }}
        />
        <Table.Column
          dataIndex="filename"
          title={t.photo}
          render={(_, record: any) => {
            const filename = record.filename;
            const token = localStorage.getItem('refine-auth');
            const imageUrl = filename === 'no-photo.jpg' 
              ? '/no-photo.jpg' 
              : `https://api.thechildrenworld.com/api/uploads/activity-photos/${filename}?token=${token}`;
            return (
              <Image
                width={60}
                height={60}
                src={imageUrl}
                style={{ objectFit: 'cover', borderRadius: 4 }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            );
          }}
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

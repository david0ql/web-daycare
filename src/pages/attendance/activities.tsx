import React, { useState, useMemo } from "react";
import { List } from "@refinedev/antd";
import {
  Table,
  Avatar,
  Tag,
  Space,
  Button,
  Typography,
  Modal,
  Card,
  Row,
  Col,
  Tooltip,
  Popover,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  ActivityTypeEnum,
  ActivityStatusEnum,
  ACTIVITY_TYPE_LABELS_BY_LANGUAGE,
  ACTIVITY_TYPE_ICONS,
} from "../../domains/attendance/types/daily-activities.types";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLanguage } from "../../shared/contexts/language.context";
import { axiosInstance } from "../../shared";
import { FLORIDA_TIMEZONE } from "../../shared/i18n/locale";

const { Text } = Typography;

interface GroupedRow {
  key: string;
  attendanceId: number;
  childId: number;
  child: any;
  attendance: any;
  activities: any[];
}

const TRANSLATIONS = {
  english: {
    title: "Daily Activities",
    registerActivity: "Register Activity",
    child: "Child",
    activities: "Activities",
    date: "Date",
    actions: "Actions",
    completed: "Completed",
    pending: "Pending",
    rejected: "Rejected",
    viewActivities: "View Activities",
    edit: "Edit",
    close: "Close",
    status: "Status",
    time: "Time",
    notes: "Notes",
    noNotes: "No notes",
    registeredBy: "Registered by",
    of: "of",
    records: "records",
    missingActivities: "Missing Activities",
    nothingMissing: "All activities completed",
  },
  spanish: {
    title: "Actividades diarias",
    registerActivity: "Registrar actividad",
    child: "Niño",
    activities: "Actividades",
    date: "Fecha",
    actions: "Acciones",
    completed: "Completada",
    pending: "Pendiente",
    rejected: "Rechazada",
    viewActivities: "Ver actividades",
    edit: "Editar",
    close: "Cerrar",
    status: "Estado",
    time: "Hora",
    notes: "Notas",
    noNotes: "Sin notas",
    registeredBy: "Registrado por",
    of: "de",
    records: "registros",
    missingActivities: "Actividades faltantes",
    nothingMissing: "Todas las actividades completadas",
  },
} as const;
 
const MANDATORY_ACTIVITIES = [
  ActivityTypeEnum.BREAKFAST,
  ActivityTypeEnum.LUNCH,
  ActivityTypeEnum.SNACK,
  ActivityTypeEnum.NAP,
  ActivityTypeEnum.HYDRATION,
  ActivityTypeEnum.DIAPER_CHANGE,
];


export const AttendanceActivities: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<GroupedRow | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["attendance/daily-activities", "grouped-list"],
    queryFn: async () => {
      const response = await axiosInstance.get("/attendance/daily-activities/all", {
        params: { take: 200, page: 1, order: "DESC" },
      });
      return response.data?.data ?? response.data ?? [];
    },
  });

  const groupedRows = useMemo<GroupedRow[]>(() => {
    if (!rawData?.length) return [];
    const map = new Map<string, GroupedRow>();
    for (const activity of rawData) {
      const key = `${activity.childId}-${activity.attendanceId}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          attendanceId: activity.attendanceId,
          childId: activity.childId,
          child: activity.child,
          attendance: activity.attendance,
          activities: [],
        });
      }
      map.get(key)!.activities.push(activity);
    }
    return Array.from(map.values()).sort((a, b) => {
      const dateA = a.attendance?.attendanceDate ?? "";
      const dateB = b.attendance?.attendanceDate ?? "";
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      const nameA = `${a.child?.firstName ?? ""} ${a.child?.lastName ?? ""}`.trim().toLowerCase();
      const nameB = `${b.child?.firstName ?? ""} ${b.child?.lastName ?? ""}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [rawData]);

  const getStatusTag = (completed: number) => {
    if (completed === ActivityStatusEnum.COMPLETED)
      return <Tag color="green" icon={<CheckCircleOutlined />}>{t.completed}</Tag>;
    if (completed === ActivityStatusEnum.REJECTED)
      return <Tag color="red" icon={<CloseCircleOutlined />}>{t.rejected}</Tag>;
    return <Tag color="orange" icon={<ClockCircleOutlined />}>{t.pending}</Tag>;
  };

  return (
    <List
      title={t.title}
      headerButtons={[
        <Button
          type="primary"
          key="create"
          icon={<PlusOutlined />}
          onClick={() => navigate("/attendance/activities/create")}
        >
          {t.registerActivity}
        </Button>,
      ]}
    >
      <Table
        dataSource={groupedRows}
        rowKey="key"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: groupedRows.length,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} ${t.of} ${total} ${t.records}`,
        }}
      >
        <Table.Column
          title={t.child}
          dataIndex="child"
          render={(_: any, row: GroupedRow) => {
            const profilePicture = row.child?.profilePicture;
            const avatarSrc = profilePicture
              ? profilePicture.startsWith("http")
                ? profilePicture
                : `https://api.thechildrenworld.com/api${profilePicture}`
              : null;
            
            const registeredTypes = row.activities.map((a) => a.activityType);
            const missing = MANDATORY_ACTIVITIES.filter(
              (type) => !registeredTypes.includes(type)
            );

            const content = (
              <div style={{ maxWidth: 250 }}>
                {missing.length > 0 ? (
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    {missing.map((type) => (
                      <div key={type} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{ACTIVITY_TYPE_ICONS[type]}</span>
                        <Text>{ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][type]}</Text>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">{t.nothingMissing}</Text>
                )}
              </div>
            );

            return (
              <Space>
                <Popover
                  content={content}
                  title={t.missingActivities}
                  trigger="hover"
                  placement="right"
                >
                  <Avatar
                    src={avatarSrc}
                    size="small"
                    style={{ cursor: "pointer" }}
                  >
                    {row.child?.firstName?.[0]}
                    {row.child?.lastName?.[0]}
                  </Avatar>
                </Popover>
                <Text strong>
                  {row.child?.firstName} {row.child?.lastName}
                </Text>
              </Space>
            );
          }}
        />
        <Table.Column
          title={t.date}
          render={(_: any, row: GroupedRow) => (
            <Text>
              {row.attendance?.attendanceDate
                ? dayjs(row.attendance.attendanceDate).format(
                    language === "spanish" ? "YYYY-MM-DD" : "MM/DD/YYYY"
                  )
                : "-"}
            </Text>
          )}
        />
        <Table.Column
          title={t.activities}
          render={(_: any, row: GroupedRow) => (
            <Space wrap>
              {row.activities.map((act) => (
                <Tooltip
                  key={act.id}
                  title={
                    ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][
                      act.activityType as ActivityTypeEnum
                    ]
                  }
                >
                  <Tag
                    color={
                      act.completed === ActivityStatusEnum.COMPLETED
                        ? "green"
                        : act.completed === ActivityStatusEnum.REJECTED
                        ? "red"
                        : "orange"
                    }
                  >
                    {ACTIVITY_TYPE_ICONS[act.activityType as keyof typeof ACTIVITY_TYPE_ICONS]}{" "}
                    {ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][act.activityType as ActivityTypeEnum]}
                  </Tag>
                </Tooltip>
              ))}
            </Space>
          )}
        />
        <Table.Column
          title={t.actions}
          render={(_: any, row: GroupedRow) => (
            <Space>
              <Tooltip title={t.viewActivities}>
                <Button
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => {
                    setSelectedRow(row);
                    setViewModalOpen(true);
                  }}
                />
              </Tooltip>
              <Tooltip title={t.edit}>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() =>
                    navigate(`/attendance/activities/bulk-edit/${row.attendanceId}`)
                  }
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>

      {/* View Modal */}
      <Modal
        title={
          <Space>
            <Avatar src={selectedRow?.child?.profilePicture} size="small">
              {selectedRow?.child?.firstName?.[0]}
              {selectedRow?.child?.lastName?.[0]}
            </Avatar>
            <Text strong>
              {selectedRow?.child?.firstName} {selectedRow?.child?.lastName}
            </Text>
            {selectedRow?.attendance?.attendanceDate && (
              <Text type="secondary">
                —{" "}
                {dayjs(selectedRow.attendance.attendanceDate).format(
                  language === "spanish" ? "YYYY-MM-DD" : "MM/DD/YYYY"
                )}
              </Text>
            )}
          </Space>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            {t.close}
          </Button>,
        ]}
        width={700}
      >
        <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
          {selectedRow?.activities.map((act) => (
            <Col key={act.id} xs={24} sm={12}>
              <Card
                size="small"
                title={
                  <Space>
                    <span style={{ fontSize: 18 }}>
                      {ACTIVITY_TYPE_ICONS[act.activityType as keyof typeof ACTIVITY_TYPE_ICONS]}
                    </span>
                    {ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][act.activityType as ActivityTypeEnum]}
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text strong>{t.status}: </Text>
                    {getStatusTag(act.completed)}
                  </div>
                  {act.completed === ActivityStatusEnum.COMPLETED && act.timeCompleted && (
                    <div>
                      <Text strong>{t.time}: </Text>
                      <Text>{dayjs(act.timeCompleted).tz(FLORIDA_TIMEZONE).format("h:mm A")}</Text>
                    </div>
                  )}
                  <div>
                    <Text strong>{t.notes}: </Text>
                    <Text type="secondary">{act.notes || t.noNotes}</Text>
                  </div>
                  <div>
                    <Text strong>{t.registeredBy}: </Text>
                    <Text type="secondary">
                      {act.createdBy2?.firstName} {act.createdBy2?.lastName}
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </List>
  );
};

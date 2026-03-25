import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Row,
  Col,
  Select,
  TimePicker,
  Input,
  Button,
  Space,
  Typography,
  Avatar,
  Tag,
  Popconfirm,
  Spin,
  Alert,
  message,
} from "antd";
import {
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  ActivityTypeEnum,
  ActivityStatusEnum,
  ACTIVITY_TYPE_LABELS_BY_LANGUAGE,
  ACTIVITY_TYPE_ICONS,
} from "../../../domains/attendance/types/daily-activities.types";
import { axiosInstance } from "../../../shared";
import dayjs from "dayjs";
import { useLanguage } from "../../../shared/contexts/language.context";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

interface ActivityEditState {
  completed: number;
  timeCompleted?: dayjs.Dayjs | null;
  notes?: string;
}

const TRANSLATIONS = {
  english: {
    title: "Edit Daily Activities",
    save: "Save Changes",
    back: "Back",
    status: "Status",
    statusPending: "Pending",
    statusCompleted: "Completed",
    statusRejected: "Rejected",
    completionTime: "Completion Time",
    selectTime: "Select time",
    notes: "Notes",
    notesPlaceholder: "Additional notes...",
    deleteConfirm: "Delete this activity?",
    deleteYes: "Yes, delete",
    deleteNo: "No",
    savedSuccess: "Activities saved successfully",
    saveError: "Error saving activities. Please try again.",
    deleteSuccess: "Activity deleted",
    deleteError: "Error deleting activity",
    timeRequired: "Completion time is required for completed activities",
    noActivities: "No activities found for this record",
  },
  spanish: {
    title: "Editar actividades diarias",
    save: "Guardar cambios",
    back: "Volver",
    status: "Estado",
    statusPending: "Pendiente",
    statusCompleted: "Completado",
    statusRejected: "Rechazado",
    completionTime: "Hora de finalización",
    selectTime: "Seleccionar hora",
    notes: "Notas",
    notesPlaceholder: "Notas adicionales...",
    deleteConfirm: "¿Eliminar esta actividad?",
    deleteYes: "Sí, eliminar",
    deleteNo: "No",
    savedSuccess: "Actividades guardadas correctamente",
    saveError: "Error al guardar las actividades. Inténtalo de nuevo.",
    deleteSuccess: "Actividad eliminada",
    deleteError: "Error al eliminar la actividad",
    timeRequired:
      "La hora de finalización es requerida para actividades completadas",
    noActivities: "No se encontraron actividades para este registro",
  },
} as const;

export const AttendanceActivitiesBulkEdit: React.FC = () => {
  const { attendanceId } = useParams<{ attendanceId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const queryClient = useQueryClient();

  const [editState, setEditState] = useState<Record<number, ActivityEditState>>(
    {},
  );
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const { data: activities, isLoading } = useQuery({
    queryKey: ["daily-activities-by-attendance", attendanceId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/attendance/daily-activities/attendance/${attendanceId}`,
      );
      return response.data ?? [];
    },
    enabled: !!attendanceId,
  });

  useEffect(() => {
    if (activities?.length) {
      const initial: Record<number, ActivityEditState> = {};
      for (const act of activities) {
        initial[act.id] = {
          completed: Number(act.completed ?? 0),
          timeCompleted: act.timeCompleted ? dayjs(act.timeCompleted) : null,
          notes: act.notes ?? "",
        };
      }
      setEditState(initial);
    }
  }, [activities]);

  const visibleActivities = (activities ?? []).filter(
    (act: any) => !deletedIds.has(act.id),
  );

  const childInfo = visibleActivities[0]?.child;
  const attendanceInfo = visibleActivities[0]?.attendance;

  const handleFieldChange = (
    id: number,
    field: keyof ActivityEditState,
    value: any,
  ) => {
    setEditState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/attendance/daily-activities/${id}`);
      setDeletedIds((prev) => new Set([...prev, id]));
      message.success(t.deleteSuccess);
    } catch {
      message.error(t.deleteError);
    }
  };

  const handleSave = async () => {
    for (const act of visibleActivities) {
      const state = editState[act.id];
      if (
        state?.completed === ActivityStatusEnum.COMPLETED &&
        !state?.timeCompleted
      ) {
        message.error(t.timeRequired);
        return;
      }
    }

    const updates = visibleActivities.map((act: any) => {
      const state = editState[act.id];
      return {
        id: act.id,
        completed: state?.completed ?? Number(act.completed),
        timeCompleted:
          state?.completed === ActivityStatusEnum.COMPLETED &&
          state?.timeCompleted
            ? state.timeCompleted.toISOString()
            : undefined,
        notes: state?.notes ?? act.notes,
      };
    });

    setSaving(true);
    try {
      await axiosInstance.patch("/attendance/daily-activities/bulk-update", {
        updates,
      });
      message.success(t.savedSuccess);
      await queryClient.invalidateQueries({
        queryKey: ["attendance/daily-activities"],
      });
      navigate("/attendance/activities");
    } catch {
      message.error(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/attendance/activities")}
        >
          {t.back}
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          {t.title}
        </Title>
        {childInfo && (
          <Space>
            <Avatar src={childInfo.profilePicture} size="small">
              {childInfo.firstName?.[0]}
              {childInfo.lastName?.[0]}
            </Avatar>
            <Text strong>
              {childInfo.firstName} {childInfo.lastName}
            </Text>
          </Space>
        )}
        {attendanceInfo?.attendanceDate && (
          <Tag color="blue">
            {dayjs(attendanceInfo.attendanceDate).format(
              language === "spanish" ? "YYYY-MM-DD" : "MM/DD/YYYY",
            )}
          </Tag>
        )}
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
          disabled={visibleActivities.length === 0}
          style={{ marginLeft: "auto" }}
        >
          {"je"}
        </Button>
      </div>

      {/* No activities */}
      {visibleActivities.length === 0 && (
        <Alert
          type="info"
          message={t.noActivities}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Activity Cards */}
      <Row gutter={[16, 16]}>
        {visibleActivities.map((act: any) => {
          const state = editState[act.id] ?? {
            completed: 0,
            timeCompleted: null,
            notes: "",
          };
          return (
            <Col key={act.id} xs={24} sm={12} lg={8}>
              <Card
                size="small"
                title={
                  <Space>
                    <span style={{ fontSize: 18 }}>
                      {
                        ACTIVITY_TYPE_ICONS[
                          act.activityType as keyof typeof ACTIVITY_TYPE_ICONS
                        ]
                      }
                    </span>
                    {
                      ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][
                        act.activityType as ActivityTypeEnum
                      ]
                    }
                  </Space>
                }
                extra={
                  <Popconfirm
                    title={t.deleteConfirm}
                    okText={t.deleteYes}
                    cancelText={t.deleteNo}
                    onConfirm={() => handleDelete(act.id)}
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      type="text"
                    />
                  </Popconfirm>
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {/* Status */}
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 4 }}>
                      {t.status}
                    </Text>
                    <Select
                      value={state.completed}
                      onChange={(val) =>
                        handleFieldChange(act.id, "completed", val)
                      }
                      style={{ width: "100%" }}
                      size="small"
                    >
                      <Option value={ActivityStatusEnum.PENDING}>
                        ⏳ {t.statusPending}
                      </Option>
                      <Option value={ActivityStatusEnum.COMPLETED}>
                        ✅ {t.statusCompleted}
                      </Option>
                      <Option value={ActivityStatusEnum.REJECTED}>
                        ❌ {t.statusRejected}
                      </Option>
                    </Select>
                  </div>

                  {/* Time (only when completed) */}
                  {state.completed === ActivityStatusEnum.COMPLETED && (
                    <div>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: 4 }}
                      >
                        {t.completionTime}
                      </Text>
                      <TimePicker
                        value={state.timeCompleted ?? undefined}
                        onChange={(val) =>
                          handleFieldChange(act.id, "timeCompleted", val)
                        }
                        format="h:mm A"
                        use12Hours
                        placeholder={t.selectTime}
                        style={{ width: "100%" }}
                        size="small"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 4 }}>
                      {t.notes}
                    </Text>
                    <TextArea
                      value={state.notes ?? ""}
                      onChange={(e) =>
                        handleFieldChange(act.id, "notes", e.target.value)
                      }
                      rows={2}
                      placeholder={t.notesPlaceholder}
                      size="small"
                    />
                  </div>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

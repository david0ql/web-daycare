import React, { useState, useMemo } from "react";
import { Create } from "@refinedev/antd";
import {
  Select,
  TimePicker,
  Row,
  Col,
  Card,
  Space,
  Tag,
  Typography,
  Divider,
  Input,
  Button,
  message,
  Alert,
} from "antd";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
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
const { Text } = Typography;

// Activity types that can have multiple records per attendance
const REPEATABLE_TYPES = [ActivityTypeEnum.DIAPER_CHANGE, ActivityTypeEnum.HYDRATION];

interface ActivityFormState {
  completed: number;
  timeCompleted?: dayjs.Dayjs | null;
  notes?: string;
}

type SelectedActivities = Partial<Record<ActivityTypeEnum, ActivityFormState>>;

const TRANSLATIONS = {
  english: {
    title: "Register Daily Activities",
    save: "Save Activities",
    child: "Child",
    selectChildRequired: "Please select a child",
    selectChild: "Select a child",
    loading: "Loading...",
    noChildren: "No children available",
    attendanceRecord: "Attendance Record",
    selectAttendanceRequired: "Please select an attendance record",
    selectAttendance: "Select an attendance record",
    firstSelectChild: "First select a child",
    noAttendanceToday: "No attendance records for today",
    activitiesTitle: "Select Activities",
    activitiesSubtitle: "Select one or more activities. Fields marked with status, time, and notes can be configured per activity.",
    noAvailableActivities: "All activities have already been registered for this attendance record.",
    select: "Select",
    selected: "Selected ✓",
    status: "Status",
    statusRequired: "Please select the status",
    statusPending: "Pending",
    statusCompleted: "Completed",
    statusRejected: "Rejected",
    completionTime: "Completion Time",
    selectCompletionTimeRequired: "Please select completion time",
    selectTime: "Select time",
    notes: "Notes",
    notesPlaceholder: "Additional notes (optional)",
    noActivitiesSelected: "Please select at least one activity",
    completionTimeRequired: "Completion time is required when status is Completed",
    successMessage: "Activities created successfully",
    errorMessage: "Error creating activities. Please try again.",
    alreadyRegistered: "Already registered (cannot add again)",
    canRepeat: "Can be added multiple times",
  },
  spanish: {
    title: "Registrar Actividades Diarias",
    save: "Guardar Actividades",
    child: "Niño",
    selectChildRequired: "Por favor selecciona un niño",
    selectChild: "Selecciona un niño",
    loading: "Cargando...",
    noChildren: "No hay niños disponibles",
    attendanceRecord: "Registro de asistencia",
    selectAttendanceRequired: "Por favor selecciona un registro de asistencia",
    selectAttendance: "Selecciona un registro de asistencia",
    firstSelectChild: "Primero selecciona un niño",
    noAttendanceToday: "No hay registros de asistencia para hoy",
    activitiesTitle: "Seleccionar Actividades",
    activitiesSubtitle: "Selecciona una o más actividades. El estado, hora y notas se configuran por actividad.",
    noAvailableActivities: "Todas las actividades ya han sido registradas para este registro de asistencia.",
    select: "Seleccionar",
    selected: "Seleccionado ✓",
    status: "Estado",
    statusRequired: "Por favor selecciona el estado",
    statusPending: "Pendiente",
    statusCompleted: "Completado",
    statusRejected: "Rechazado",
    completionTime: "Hora de finalización",
    selectCompletionTimeRequired: "Por favor selecciona la hora de finalización",
    selectTime: "Selecciona hora",
    notes: "Notas",
    notesPlaceholder: "Notas adicionales (opcional)",
    noActivitiesSelected: "Por favor selecciona al menos una actividad",
    completionTimeRequired: "La hora de finalización es requerida cuando el estado es Completado",
    successMessage: "Actividades creadas correctamente",
    errorMessage: "Error al crear las actividades. Inténtalo de nuevo.",
    alreadyRegistered: "Ya registrada (no se puede agregar de nuevo)",
    canRepeat: "Se puede registrar varias veces",
  },
} as const;

// ─── Per-activity inline form ────────────────────────────────────────────────
interface ActivityCardProps {
  actType: ActivityTypeEnum;
  isSelected: boolean;
  formState?: ActivityFormState;
  onToggle: () => void;
  onChange: (data: Partial<ActivityFormState>) => void;
  t: typeof TRANSLATIONS["english"];
  language: "english" | "spanish";
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  actType,
  isSelected,
  formState,
  onToggle,
  onChange,
  t,
  language,
}) => {
  const label = ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][actType];
  const icon = ACTIVITY_TYPE_ICONS[actType];
  const isRepeatable = REPEATABLE_TYPES.includes(actType);

  return (
    <Card
      style={{
        marginBottom: 12,
        border: isSelected ? "2px solid #1677ff" : "1px solid #d9d9d9",
        background: isSelected ? "#f0f7ff" : "#ffffff",
        transition: "all 0.2s",
      }}
      styles={{ body: { padding: "12px 16px" } }}
    >
      {/* Header row — click to toggle */}
      <div
        onClick={onToggle}
        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Space>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <Text strong style={{ fontSize: 15 }}>{label}</Text>
          {isRepeatable && (
            <Tag color="geekblue" style={{ fontSize: 11 }}>{t.canRepeat}</Tag>
          )}
        </Space>
        <Tag
          color={isSelected ? "blue" : "default"}
          style={{ cursor: "pointer", fontWeight: 600 }}
        >
          {isSelected ? t.selected : t.select}
        </Tag>
      </div>

      {/* Expanded form — only when selected */}
      {isSelected && formState && (
        <>
          <Divider style={{ margin: "12px 0" }} />
          <Row gutter={16}>
            <Col span={formState.completed === ActivityStatusEnum.COMPLETED ? 12 : 24}>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  {t.status}
                </Text>
                <Select
                  value={formState.completed}
                  onChange={(v) => onChange({ completed: v, timeCompleted: v !== ActivityStatusEnum.COMPLETED ? null : formState.timeCompleted })}
                  style={{ width: "100%" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Select.Option value={ActivityStatusEnum.PENDING}>⏳ {t.statusPending}</Select.Option>
                  <Select.Option value={ActivityStatusEnum.COMPLETED}>✅ {t.statusCompleted}</Select.Option>
                  <Select.Option value={ActivityStatusEnum.REJECTED}>❌ {t.statusRejected}</Select.Option>
                </Select>
              </div>
            </Col>

            {formState.completed === ActivityStatusEnum.COMPLETED && (
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                    {t.completionTime} <Text type="danger">*</Text>
                  </Text>
                  <TimePicker
                    value={formState.timeCompleted ?? null}
                    onChange={(v) => onChange({ timeCompleted: v })}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: "100%" }}
                    format="h:mm A"
                    use12Hours
                    placeholder={t.selectTime}
                  />
                </div>
              </Col>
            )}
          </Row>

          <div>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              {t.notes}
            </Text>
            <TextArea
              value={formState.notes ?? ""}
              onChange={(e) => onChange({ notes: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              rows={2}
              placeholder={t.notesPlaceholder}
              maxLength={500}
            />
          </div>
        </>
      )}
    </Card>
  );
};

// ─── Main create page ─────────────────────────────────────────────────────────
export const AttendanceActivitiesCreate: React.FC = () => {
  const { attendanceId: urlAttendanceId } = useParams();
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(undefined);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<number | undefined>(
    urlAttendanceId ? parseInt(urlAttendanceId) : undefined,
  );
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivities>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch children ──────────────────────────────────────────────────────────
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const response = await axiosInstance.get("/children");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch today's attendance filtered by child ──────────────────────────────
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance", "today", selectedChildId],
    queryFn: async () => {
      if (!selectedChildId) return [];
      const todayResponse = await axiosInstance.get("/attendance/today");
      const todayAttendances = todayResponse.data || [];
      if (todayAttendances.length === 0) {
        const allResponse = await axiosInstance.get("/attendance");
        const all = allResponse.data?.data || [];
        return all.filter((a: any) => a.childId === selectedChildId);
      }
      return todayAttendances.filter((a: any) => a.childId === selectedChildId);
    },
    enabled: !!selectedChildId,
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch existing activities for selected attendance ───────────────────────
  const { data: existingActivities } = useQuery({
    queryKey: ["daily-activities", selectedAttendanceId],
    queryFn: async () => {
      if (!selectedAttendanceId) return [];
      const response = await axiosInstance.get(
        `/attendance/daily-activities/attendance/${selectedAttendanceId}`,
      );
      return response.data || [];
    },
    enabled: !!selectedAttendanceId,
    staleTime: 0, // always fresh when attendance changes
  });

  // ── Available activity types ────────────────────────────────────────────────
  const existingTypes: ActivityTypeEnum[] = useMemo(
    () => (existingActivities || []).map((a: any) => a.activityType as ActivityTypeEnum),
    [existingActivities],
  );

  const availableTypes = useMemo(
    () =>
      Object.values(ActivityTypeEnum).filter(
        (type) => REPEATABLE_TYPES.includes(type) || !existingTypes.includes(type),
      ),
    [existingTypes],
  );

  const unavailableTypes = useMemo(
    () =>
      Object.values(ActivityTypeEnum).filter(
        (type) => !REPEATABLE_TYPES.includes(type) && existingTypes.includes(type),
      ),
    [existingTypes],
  );

  // ── Toggle / update activity selection ─────────────────────────────────────
  const handleToggle = (type: ActivityTypeEnum) => {
    setSelectedActivities((prev) => {
      if (prev[type] !== undefined) {
        const next = { ...prev };
        delete next[type];
        return next;
      }
      return {
        ...prev,
        [type]: { completed: ActivityStatusEnum.PENDING, timeCompleted: null, notes: "" },
      };
    });
  };

  const handleChange = (type: ActivityTypeEnum, data: Partial<ActivityFormState>) => {
    setSelectedActivities((prev) => ({
      ...prev,
      [type]: { ...prev[type]!, ...data },
    }));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const entries = Object.entries(selectedActivities) as [ActivityTypeEnum, ActivityFormState][];

    if (entries.length === 0) {
      message.warning(t.noActivitiesSelected);
      return;
    }

    // Validate: completed activities must have timeCompleted
    const missing = entries.filter(
      ([, data]) => data.completed === ActivityStatusEnum.COMPLETED && !data.timeCompleted,
    );
    if (missing.length > 0) {
      const labels = missing
        .map(([type]) => ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][type])
        .join(", ");
      message.error(`${t.completionTimeRequired}: ${labels}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const activities = entries.map(([activityType, data]) => ({
        activityType,
        completed: data.completed,
        timeCompleted:
          data.completed === ActivityStatusEnum.COMPLETED && data.timeCompleted
            ? data.timeCompleted.toISOString()
            : undefined,
        notes: data.notes?.trim() || undefined,
      }));

      await axiosInstance.post("/attendance/daily-activities/bulk", {
        childId: selectedChildId,
        attendanceId: selectedAttendanceId,
        activities,
      });

      message.success(t.successMessage);
      navigate(-1);
    } catch {
      message.error(t.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = Object.keys(selectedActivities).length;
  const canSubmit =
    !!selectedChildId &&
    !!selectedAttendanceId &&
    selectedCount > 0 &&
    !isSubmitting;

  return (
    <Create
      title={t.title}
      footerButtons={
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!canSubmit}
        >
          {t.save}
          {selectedCount > 0 ? ` (${selectedCount})` : ""}
        </Button>
      }
    >
      {/* ── Step 1 & 2: Child + Attendance ── */}
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>
              {t.child} <Text type="danger">*</Text>
            </Text>
            <Select
              value={selectedChildId}
              placeholder={t.selectChild}
              showSearch
              style={{ width: "100%" }}
              loading={childrenLoading}
              notFoundContent={childrenLoading ? t.loading : t.noChildren}
              filterOption={(input, option) =>
                String(option?.children ?? "").toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                setSelectedChildId(value);
                setSelectedAttendanceId(undefined);
                setSelectedActivities({});
              }}
            >
              {(childrenData?.data || [])
                .slice()
                .sort((a: any, b: any) =>
                  `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
                )
                .map((child: any) => (
                  <Select.Option key={child.id} value={child.id}>
                    {child.firstName} {child.lastName}
                  </Select.Option>
                ))}
            </Select>
          </div>
        </Col>

        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>
              {t.attendanceRecord} <Text type="danger">*</Text>
            </Text>
            <Select
              value={selectedAttendanceId}
              placeholder={selectedChildId ? t.selectAttendance : t.firstSelectChild}
              style={{ width: "100%" }}
              loading={attendanceLoading}
              disabled={!selectedChildId}
              notFoundContent={
                attendanceLoading ? t.loading : !selectedChildId ? t.firstSelectChild : t.noAttendanceToday
              }
              onChange={(value) => {
                setSelectedAttendanceId(value);
                setSelectedActivities({});
              }}
            >
              {(attendanceData || []).map((attendance: any) => (
                <Select.Option key={attendance.id} value={attendance.id}>
                  {attendance.child?.firstName} {attendance.child?.lastName} —{" "}
                  {dayjs(attendance.attendanceDate).format(
                    language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY",
                  )}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>

      {/* ── Step 3: Activity cards ── */}
      {selectedAttendanceId && (
        <>
          <Divider />
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 16 }}>{t.activitiesTitle}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 13 }}>{t.activitiesSubtitle}</Text>
          </div>

          {availableTypes.length === 0 ? (
            <Alert message={t.noAvailableActivities} type="info" showIcon />
          ) : (
            <Row gutter={16}>
              {availableTypes.map((type) => (
                <Col key={type} xs={24} sm={24} md={12}>
                  <ActivityCard
                    actType={type}
                    isSelected={selectedActivities[type] !== undefined}
                    formState={selectedActivities[type]}
                    onToggle={() => handleToggle(type)}
                    onChange={(data) => handleChange(type, data)}
                    t={t}
                    language={language}
                  />
                </Col>
              ))}
            </Row>
          )}

          {/* Already registered activities (greyed out) */}
          {unavailableTypes.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {t.alreadyRegistered}:{" "}
                {unavailableTypes
                  .map((type) => `${ACTIVITY_TYPE_ICONS[type]} ${ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][type]}`)
                  .join("  ·  ")}
              </Text>
            </div>
          )}
        </>
      )}
    </Create>
  );
};

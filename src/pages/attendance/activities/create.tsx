import React, { useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, Switch, TimePicker, Row, Col } from "antd";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ActivityTypeEnum, ACTIVITY_TYPE_LABELS_BY_LANGUAGE } from "../../../domains/attendance/types/daily-activities.types";
import { axiosInstance } from "../../../shared";
import dayjs from 'dayjs';
import { useLanguage } from "../../../shared/contexts/language.context";

const { TextArea } = Input;
const { Option } = Select;

const ATTENDANCE_ACTIVITIES_CREATE_TRANSLATIONS = {
  english: {
    title: "Register Daily Activity",
    save: "Save",
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
    activityType: "Activity Type",
    selectActivityTypeRequired: "Please select activity type",
    selectActivityType: "Select activity type",
    firstSelectAttendance: "First select an attendance record",
    noActivityTypes: "No activity types available",
    completed: "Completed",
    completionTime: "Completion Time",
    selectCompletionTimeRequired: "Please select completion time",
    selectTime: "Select time",
    notes: "Notes",
    notesPlaceholder: "Additional notes about the activity (optional)",
  },
  spanish: {
    title: "Registrar actividad diaria",
    save: "Guardar",
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
    activityType: "Tipo de actividad",
    selectActivityTypeRequired: "Por favor selecciona el tipo de actividad",
    selectActivityType: "Selecciona tipo de actividad",
    firstSelectAttendance: "Primero selecciona un registro de asistencia",
    noActivityTypes: "No hay tipos de actividad disponibles",
    completed: "Completado",
    completionTime: "Hora de finalización",
    selectCompletionTimeRequired: "Por favor selecciona la hora de finalización",
    selectTime: "Selecciona hora",
    notes: "Notas",
    notesPlaceholder: "Notas adicionales sobre la actividad (opcional)",
  },
} as const;

export const AttendanceActivitiesCreate: React.FC = () => {
  const { attendanceId } = useParams();
  const { language } = useLanguage();
  const t = ATTENDANCE_ACTIVITIES_CREATE_TRANSLATIONS[language];
  const { formProps, saveButtonProps } = useForm();
  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(undefined);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<number | undefined>(undefined);
  
  // Fetch children for the select
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const response = await axiosInstance.get("/children");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch today's attendance records for the selected child
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance", "today", selectedChildId],
    queryFn: async () => {
      if (!selectedChildId) {
        return [];
      }
      
      // Get today's attendance and filter by selected child
      const todayResponse = await axiosInstance.get("/attendance/today");
      const todayAttendances = todayResponse.data || [];
      
      // If no today's records, get all attendance records for this child
      if (todayAttendances.length === 0) {
        const allResponse = await axiosInstance.get("/attendance");
        const allAttendances = allResponse.data?.data || [];
        return allAttendances.filter((attendance: any) => attendance.childId === selectedChildId);
      }
      
      // Filter by selected child
      return todayAttendances.filter((attendance: any) => attendance.childId === selectedChildId);
    },
    enabled: !!selectedChildId, // Only run query when a child is selected
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch existing activities for the selected attendance
  const { data: existingActivities } = useQuery({
    queryKey: ["daily-activities", selectedAttendanceId],
    queryFn: async () => {
      if (!selectedAttendanceId) {
        return [];
      }
      
      const response = await axiosInstance.get(`/attendance/daily-activities/attendance/${selectedAttendanceId}`);
      return response.data || [];
    },
    enabled: !!selectedAttendanceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleFinish = (values: any) => {
    const formData = {
      ...values,
      attendanceId: values.attendanceId || (attendanceId ? parseInt(attendanceId) : undefined),
      timeCompleted: values.completed && values.timeCompleted ? values.timeCompleted.toDate() : undefined,
    };
    
    formProps.onFinish?.(formData);
  };

  return (
    <Create
      title={t.title}
      saveButtonProps={{ ...saveButtonProps, children: t.save }}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
                <Form.Item
                  label={t.child}
                  name="childId"
                  rules={[{ required: true, message: t.selectChildRequired }]}
                >
                  <Select 
                    placeholder={t.selectChild} 
                    showSearch
                    loading={childrenLoading}
                    notFoundContent={childrenLoading ? t.loading : t.noChildren}
                    onChange={(value) => {
                      setSelectedChildId(value);
                      // Clear attendance selection when child changes
                      formProps.form?.setFieldsValue({ attendanceId: undefined });
                    }}
                  >
                    {(childrenData?.data || []).map((child: any) => (
                      <Option key={child.id} value={child.id}>
                        {child.firstName} {child.lastName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label={t.attendanceRecord}
              name="attendanceId"
              rules={[{ required: true, message: t.selectAttendanceRequired }]}
              initialValue={attendanceId ? parseInt(attendanceId) : undefined}
            >
              <Select 
                placeholder={selectedChildId ? t.selectAttendance : t.firstSelectChild} 
                showSearch
                loading={attendanceLoading}
                disabled={!selectedChildId}
                onChange={(value) => {
                  setSelectedAttendanceId(value);
                  // Clear activity type selection when attendance changes
                  formProps.form?.setFieldsValue({ activityType: undefined });
                }}
                notFoundContent={
                  attendanceLoading 
                    ? t.loading 
                    : !selectedChildId 
                      ? t.firstSelectChild 
                      : t.noAttendanceToday
                }
              >
                {(attendanceData || []).map((attendance: any) => (
                  <Option key={attendance.id} value={attendance.id}>
                    {attendance.child?.firstName} {attendance.child?.lastName} - {dayjs(attendance.attendanceDate).format(language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY")}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
                <Form.Item
                  label={t.activityType}
                  name="activityType"
                  rules={[{ required: true, message: t.selectActivityTypeRequired }]}
                >
                  <Select 
                    placeholder={t.selectActivityType}
                    disabled={!selectedAttendanceId}
                    notFoundContent={
                      !selectedAttendanceId 
                        ? t.firstSelectAttendance 
                        : t.noActivityTypes
                    }
                  >
                    {Object.values(ActivityTypeEnum)
                      .filter((type) => {
                        // Filter out activity types that already exist for this attendance
                        const existingTypes = (existingActivities || []).map((activity: any) => activity.activityType);
                        return !existingTypes.includes(type);
                      })
                      .map((type) => (
                        <Option key={type} value={type}>
                          {ACTIVITY_TYPE_LABELS_BY_LANGUAGE[language][type]}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label={t.completed}
              name="completed"
              valuePropName="checked"
              getValueFromEvent={(checked) => Boolean(checked)}
              getValueProps={(value) => ({ value: Boolean(value) })}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.completed !== currentValues.completed}
        >
	          {({ getFieldValue }) => {
	            const completed = getFieldValue('completed');
	            return completed ? (
	              <Row gutter={16}>
	                <Col span={12}>
	                  <Form.Item
	                    label={t.completionTime}
	                    name="timeCompleted"
	                    rules={[{ required: true, message: t.selectCompletionTimeRequired }]}
	                  >
	                    <TimePicker
	                      style={{ width: '100%' }}
	                      format="h:mm A"
	                      use12Hours
	                      placeholder={t.selectTime}
	                    />
	                  </Form.Item>
	                </Col>
	              </Row>
	            ) : null;
	          }}
	        </Form.Item>

	        <Row gutter={16}>
	          <Col span={24}>
	            <Form.Item
	              label={t.notes}
	              name="notes"
	            >
	              <TextArea 
	                rows={3}
	                placeholder={t.notesPlaceholder}
	                maxLength={500}
	                showCount
	              />
	            </Form.Item>
	          </Col>
	        </Row>
      </Form>
    </Create>
  );
};

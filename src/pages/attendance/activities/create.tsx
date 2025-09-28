import React, { useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, Switch, TimePicker, Row, Col, Typography } from "antd";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ActivityTypeEnum, ACTIVITY_TYPE_LABELS } from "../../../domains/attendance/types/daily-activities.types";
import { axiosInstance } from "../../../shared";
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const AttendanceActivitiesCreate: React.FC = () => {
  const { attendanceId } = useParams();
  const navigate = useNavigate();
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

  // Debug logs
  console.log('Children data:', childrenData);
  console.log('Attendance data:', attendanceData);
  console.log('Children data.data:', childrenData?.data);
  console.log('Attendance data.data:', attendanceData?.data);

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
      title="Registrar Actividad Diaria"
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
                <Form.Item
                  label="Niño"
                  name="childId"
                  rules={[{ required: true, message: 'Por favor seleccione un niño' }]}
                >
                  <Select 
                    placeholder="Seleccione un niño" 
                    showSearch
                    loading={childrenLoading}
                    notFoundContent={childrenLoading ? "Cargando..." : "No hay niños disponibles"}
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
              label="Registro de Asistencia"
              name="attendanceId"
              rules={[{ required: true, message: 'Por favor seleccione un registro de asistencia' }]}
              initialValue={attendanceId ? parseInt(attendanceId) : undefined}
            >
              <Select 
                placeholder={selectedChildId ? "Seleccione un registro de asistencia" : "Primero seleccione un niño"} 
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
                    ? "Cargando..." 
                    : !selectedChildId 
                      ? "Primero seleccione un niño" 
                      : "No hay registros de asistencia para hoy"
                }
              >
                {(attendanceData || []).map((attendance: any) => (
                  <Option key={attendance.id} value={attendance.id}>
                    {attendance.child?.firstName} {attendance.child?.lastName} - {dayjs(attendance.attendanceDate).format('DD/MM/YYYY')}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
                <Form.Item
                  label="Tipo de Actividad"
                  name="activityType"
                  rules={[{ required: true, message: 'Por favor seleccione el tipo de actividad' }]}
                >
                  <Select 
                    placeholder="Seleccione el tipo de actividad"
                    disabled={!selectedAttendanceId}
                    notFoundContent={
                      !selectedAttendanceId 
                        ? "Primero seleccione un registro de asistencia" 
                        : "No hay tipos de actividad disponibles"
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
                          {ACTIVITY_TYPE_LABELS[type]}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="Completada"
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
                    label="Hora de Completado"
                    name="timeCompleted"
                    rules={[{ required: true, message: 'Por favor seleccione la hora de completado' }]}
                  >
                    <TimePicker 
                      style={{ width: '100%' }}
                      format="HH:mm"
                      placeholder="Seleccione la hora"
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
              label="Notas"
              name="notes"
            >
              <TextArea 
                rows={3}
                placeholder="Notas adicionales sobre la actividad (opcional)"
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

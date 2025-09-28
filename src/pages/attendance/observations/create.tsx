import React, { useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, Typography } from "antd";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { MoodEnum, MOOD_LABELS, MOOD_ICONS } from "../../../domains/attendance/types/daily-observations.types";
import { axiosInstance } from "../../../shared";
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const AttendanceObservationsCreate: React.FC = () => {
  const { attendanceId } = useParams();
  const { formProps, saveButtonProps } = useForm();
  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(undefined);
  
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
      const response = await axiosInstance.get("/attendance/today");
      const todayAttendances = response.data || [];
      
      // Filter by selected child
      return todayAttendances.filter((attendance: any) => attendance.childId === selectedChildId);
    },
    enabled: !!selectedChildId, // Only run query when a child is selected
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
    };
    
    formProps.onFinish?.(formData);
  };

  return (
    <Create
      title="Registrar Observación Diaria"
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
              label="Estado de Ánimo"
              name="mood"
              rules={[{ required: true, message: 'Por favor seleccione el estado de ánimo' }]}
            >
              <Select placeholder="Seleccione el estado de ánimo">
                {Object.values(MoodEnum).map((mood) => (
                  <Option key={mood} value={mood}>
                    <span style={{ marginRight: 8, fontSize: '16px' }}>{MOOD_ICONS[mood]}</span>
                    {MOOD_LABELS[mood]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Observaciones Generales"
              name="generalObservations"
              rules={[{ required: true, message: 'Por favor ingrese las observaciones' }]}
            >
              <TextArea 
                rows={4}
                placeholder="Describe el comportamiento, actividades, interacciones y cualquier observación relevante del niño..."
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};

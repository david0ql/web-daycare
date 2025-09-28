import React, { useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Upload, Button, message, Row, Col, Typography, Select } from "antd";
import { UploadOutlined, CameraOutlined } from "@ant-design/icons";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../../shared";
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const AttendancePhotosCreate: React.FC = () => {
  const { attendanceId } = useParams();
  const { formProps, saveButtonProps } = useForm();
  const [fileList, setFileList] = useState<any[]>([]);
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
    if (fileList.length === 0) {
      message.error('Por favor seleccione una foto');
      return;
    }

    const formData = {
      ...values,
      attendanceId: values.attendanceId || (attendanceId ? parseInt(attendanceId) : undefined),
      file: fileList[0].originFileObj,
    };
    
    formProps.onFinish?.(formData);
  };

  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo se permiten archivos de imagen');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('La imagen debe ser menor a 5MB');
      return false;
    }

    return false; // Prevent auto upload
  };

  return (
    <Create
      title="Subir Foto de Actividad"
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
          <Col span={24}>
            <Form.Item
              label="Seleccionar Foto"
              required
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={beforeUpload}
                maxCount={1}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <CameraOutlined style={{ fontSize: '24px', color: '#999' }} />
                    <div style={{ marginTop: 8 }}>Subir Foto</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Descripción de la Foto"
              name="caption"
            >
              <TextArea 
                rows={3}
                placeholder="Describe qué se ve en la foto o qué actividad se está realizando..."
                maxLength={300}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};

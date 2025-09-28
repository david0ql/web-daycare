import React, { useState } from "react";
import { Create } from "@refinedev/antd";
import { Form, Input, Upload, Button, message, Row, Col, Typography, Select } from "antd";
import { UploadOutlined, CameraOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../shared";
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const AttendancePhotosCreate: React.FC = () => {
  const { attendanceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Debug logs
  console.log('Children data:', childrenData);
  console.log('Attendance data:', attendanceData);
  console.log('Children data.data:', childrenData?.data);
  console.log('Attendance data.data:', attendanceData?.data);

  const handleFinish = async (values: any) => {
    if (fileList.length === 0) {
      message.error('Por favor seleccione una foto');
      return;
    }

    const file = fileList[0].originFileObj;
    if (!file) {
      message.error('Error: archivo no válido');
      return;
    }

    console.log('File to upload:', file);
    console.log('File type:', file.type);
    console.log('File size:', file.size);

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('childId', parseInt(values.childId).toString());
      formData.append('attendanceId', parseInt(values.attendanceId || (attendanceId ? parseInt(attendanceId) : undefined)).toString());
      if (values.caption) {
        formData.append('caption', values.caption);
      }

      const response = await axiosInstance.post('/attendance/activity-photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('Foto subida exitosamente');
      
      // Invalidate cache
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "attendance/activity-photos");
        },
      });
      
      // Navigate back to photos list
      navigate('/attendance/photos');
      
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      message.error('Error al subir la foto: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
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
      saveButtonProps={{
        loading: isSubmitting,
        onClick: () => form.submit(),
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
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
                      form.setFieldsValue({ attendanceId: undefined });
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

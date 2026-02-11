import React, { useState } from "react";
import { Create } from "@refinedev/antd";
import { Form, Input, Upload, message, Row, Col, Select } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../shared";
import dayjs from 'dayjs';
import { useLanguage } from "../../../shared/contexts/language.context";

const { TextArea } = Input;
const { Option } = Select;

const ATTENDANCE_PHOTOS_CREATE_TRANSLATIONS = {
  english: {
    title: "Upload Activity Photo",
    upload: "Upload",
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
    selectPhoto: "Select Photo",
    uploadPhoto: "Upload Photo",
    photoRequired: "Please select a photo",
    invalidFile: "Error: invalid file",
    uploadSuccess: "Photo uploaded successfully",
    uploadErrorPrefix: "Error uploading photo",
    onlyImagesAllowed: "Only image files are allowed",
    imageTooLarge: "Image must be less than 5MB",
    photoDescription: "Photo Description",
    photoDescriptionPlaceholder:
      "Describe what is seen in the photo or what activity is being performed...",
  },
  spanish: {
    title: "Subir foto de actividad",
    upload: "Subir",
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
    selectPhoto: "Selecciona foto",
    uploadPhoto: "Subir foto",
    photoRequired: "Por favor selecciona una foto",
    invalidFile: "Error: archivo inválido",
    uploadSuccess: "Foto subida correctamente",
    uploadErrorPrefix: "Error subiendo la foto",
    onlyImagesAllowed: "Solo se permiten archivos de imagen",
    imageTooLarge: "La imagen debe ser menor a 5MB",
    photoDescription: "Descripción de la foto",
    photoDescriptionPlaceholder:
      "Describe lo que se ve en la foto o qué actividad se está realizando...",
  },
} as const;

export const AttendancePhotosCreate: React.FC = () => {
  const { attendanceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const t = ATTENDANCE_PHOTOS_CREATE_TRANSLATIONS[language];
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

  const handleFinish = async (values: any) => {
    if (fileList.length === 0) {
      message.error(t.photoRequired);
      return;
    }

    const file = fileList[0].originFileObj;
    if (!file) {
      message.error(t.invalidFile);
      return;
    }

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

      message.success(t.uploadSuccess);
      
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
      message.error(`${t.uploadErrorPrefix}: ${error.response?.data?.message || error.message}`);
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
      message.error(t.onlyImagesAllowed);
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error(t.imageTooLarge);
      return false;
    }

    return false; // Prevent auto upload
  };

  return (
    <Create
      title={t.title}
      saveButtonProps={{
        loading: isSubmitting,
        children: t.upload,
        onClick: () => form.submit(),
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
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
	              label={t.selectPhoto}
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
	                    <div style={{ marginTop: 8 }}>{t.uploadPhoto}</div>
	                  </div>
	                )}
	              </Upload>
	            </Form.Item>
	          </Col>
	        </Row>

	        <Row gutter={16}>
	          <Col span={24}>
	            <Form.Item
	              label={t.photoDescription}
	              name="caption"
	            >
	              <TextArea 
	                rows={3}
	                placeholder={t.photoDescriptionPlaceholder}
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

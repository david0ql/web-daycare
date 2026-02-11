import React, { useState } from "react";
import { useList } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Select, Input, Button, Card, Space, Avatar, Typography, Row, Col, Tabs, message, Spin } from "antd";
import { UserOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { useCheckIn, useCheckOut } from "../../domains/attendance";
import { useAuthorizedPickupPersons } from "../../domains/children";
import { axiosInstance } from "../../shared";
import { useLanguage } from "../../shared/contexts/language.context";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

const ATTENDANCE_CREATE_TRANSLATIONS = {
  english: {
    title: "Attendance Management",
    checkIn: "Check-in",
    checkOut: "Check-out",
    selectChild: "Select Child",
    selectChildRequired: "You must select a child",
    searchChild: "Search and select child",
    selectedForCheckIn: "Selected for check-in",
    selectedForCheckOut: "Selected for check-out",
    deliveredByOptional: "Delivered by (Optional)",
    deliveredByPlaceholder: "Who delivers the child?",
    firstSelectChild: "First select a child",
    checkInNotesOptional: "Check-in Notes (Optional)",
    checkInNotesPlaceholder: "Observations about the child's condition upon arrival...",
    registerCheckIn: "Register Check-in",
    checkInSuccess: "Check-in successful. The child has been registered correctly.",
    checkInErrorPrefix: "Check-in error:",
    couldNotRegisterCheckIn: "Could not register check-in",
    pickedUpBy: "Picked up by",
    pickedUpByRequired: "You must specify who picks up the child",
    pickedUpByPlaceholder: "Who picks up the child?",
    checkOutNotesRequiredLabel: "Check-out Notes (Required)",
    checkOutNotesRequired: "Check-out notes are required",
    checkOutNotesPlaceholder: "Summary of the child's day, behavior, activities performed, meals, etc...",
    registerCheckOut: "Register Check-out",
    checkOutSuccess: "Check-out successful. The child has been registered for departure correctly.",
    checkOutErrorPrefix: "Check-out error:",
    couldNotRegisterCheckOut: "Could not register check-out",
    loadingData: "Loading data...",
  },
  spanish: {
    title: "Gestión de asistencia",
    checkIn: "Entrada",
    checkOut: "Salida",
    selectChild: "Seleccionar niño",
    selectChildRequired: "Debes seleccionar un niño",
    searchChild: "Buscar y seleccionar niño",
    selectedForCheckIn: "Seleccionado para entrada",
    selectedForCheckOut: "Seleccionado para salida",
    deliveredByOptional: "Entregado por (Opcional)",
    deliveredByPlaceholder: "¿Quién entrega al niño?",
    firstSelectChild: "Primero selecciona un niño",
    checkInNotesOptional: "Notas de entrada (Opcional)",
    checkInNotesPlaceholder: "Observaciones sobre el estado del niño al llegar...",
    registerCheckIn: "Registrar entrada",
    checkInSuccess: "Entrada exitosa. El niño ha sido registrado correctamente.",
    checkInErrorPrefix: "Error de entrada:",
    couldNotRegisterCheckIn: "No se pudo registrar la entrada",
    pickedUpBy: "Recogido por",
    pickedUpByRequired: "Debes indicar quién recoge al niño",
    pickedUpByPlaceholder: "¿Quién recoge al niño?",
    checkOutNotesRequiredLabel: "Notas de salida (Requerido)",
    checkOutNotesRequired: "Las notas de salida son requeridas",
    checkOutNotesPlaceholder: "Resumen del día del niño, comportamiento, actividades realizadas, comidas, etc...",
    registerCheckOut: "Registrar salida",
    checkOutSuccess: "Salida exitosa. El niño ha sido registrado correctamente para su salida.",
    checkOutErrorPrefix: "Error de salida:",
    couldNotRegisterCheckOut: "No se pudo registrar la salida",
    loadingData: "Cargando datos...",
  },
} as const;

export const AttendanceCreate: React.FC = () => {
  const { language } = useLanguage();
  const t = ATTENDANCE_CREATE_TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState("checkin");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  // Get children data using direct axios call
  const [childrenData, setChildrenData] = React.useState<any>(null);
  const [loadingChildren, setLoadingChildren] = React.useState(true);
  const [childrenError, setChildrenError] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoadingChildren(true);
        console.log("🔍 Fetching children with direct axios call");
        const response = await axiosInstance.get("/children");
        console.log("🔍 Children response:", response);
        setChildrenData(response.data);
        setChildrenError(null);
      } catch (error) {
        console.error("🔍 Error fetching children:", error);
        setChildrenError(error);
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildren();
  }, []);

  // Debug children loading state
  console.log("🔍 Children loading state:", { loadingChildren, childrenError, childrenData });

  // Test direct axios call to children endpoint
  React.useEffect(() => {
    const testChildrenEndpoint = async () => {
      try {
        console.log("🔍 Testing direct axios call to /children endpoint");
        const response = await axiosInstance.get("/children");
        console.log("🔍 Direct children response:", response);
        console.log("🔍 Direct children data:", response.data);
        console.log("🔍 Direct children data.data:", response.data.data);
      } catch (error) {
        console.error("🔍 Direct children call error:", error);
      }
    };
    
    testChildrenEndpoint();
  }, []);

  // Get authorized pickup persons for selected child
  const { data: authorizedPersons, isLoading: loadingAuthorizedPersons, error: authorizedPersonsError } = useAuthorizedPickupPersons(selectedChild?.id);

  // Check-in mutation
  const { mutate: checkIn, isPending: checkingIn } = useCheckIn();

  // Check-out mutation
  const { mutate: checkOut, isPending: checkingOut } = useCheckOut();

  // Filter active children
  const children = (childrenData?.data || []);
  console.log("🔍 Raw children from API:", children);
  // const children = (childrenData?.data || []).filter((child: any) => child.isActive === true);

  // Debug logs
  console.log("🔍 Attendance Create - childrenData:", childrenData);
  console.log("🔍 Attendance Create - children (filtered):", children);
  console.log("🔍 Attendance Create - childrenError:", childrenError);
  console.log("🔍 Attendance Create - authorizedPersons:", authorizedPersons);
  console.log("🔍 Attendance Create - authorizedPersonsError:", authorizedPersonsError);
  console.log("🔍 Attendance Create - selectedChild:", selectedChild);

  const handleCheckIn = (values: any) => {
    checkIn({
      childId: values.childId,
      deliveredBy: values.deliveredBy,
      notes: values.checkInNotes,
    }, {
      onSuccess: () => {
        message.success(t.checkInSuccess);
        setSelectedChild(null);
      },
      onError: (error: any) => {
        message.error(`${t.checkInErrorPrefix} ${error?.response?.data?.message || t.couldNotRegisterCheckIn}`);
      }
    });
  };

  const handleCheckOut = (values: any) => {
    if (!values.pickedUpBy) {
      message.error(t.pickedUpByRequired);
      return;
    }
    if (!values.checkOutNotes) {
      message.error(t.checkOutNotesRequired);
      return;
    }
    
    checkOut({
      childId: values.childId,
      pickedUpBy: values.pickedUpBy,
      notes: values.checkOutNotes,
    }, {
      onSuccess: () => {
        message.success(t.checkOutSuccess);
        setSelectedChild(null);
      },
      onError: (error: any) => {
        message.error(`${t.checkOutErrorPrefix} ${error?.response?.data?.message || t.couldNotRegisterCheckOut}`);
      }
    });
  };

  const handleChildSelect = (childId: number) => {
    const child = (children || []).find((c: any) => c.id === childId);
    setSelectedChild(child || null);
  };

  const tabItems = [
    {
      key: "checkin",
      label: (
        <Space>
          <LoginOutlined />
          {t.checkIn}
        </Space>
      ),
      children: (
        <Form layout="vertical" onFinish={handleCheckIn}>
          <Form.Item
            label={t.selectChild}
            name="childId"
            rules={[{ required: true, message: t.selectChildRequired }]}
          >
            <Select
              placeholder={t.searchChild}
              showSearch
              optionFilterProp="children"
              onChange={handleChildSelect}
              filterOption={(input, option) =>
                String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={(children || []).map((child: any) => ({
                label: `${child.firstName} ${child.lastName}`,
                value: child.id,
              }))}
            />
          </Form.Item>

          {selectedChild && (
            <Card style={{ marginBottom: 16 }}>
              <Row align="middle" gutter={16}>
                <Col>
                  <Avatar
                    size={64}
                    src={selectedChild.profilePicture}
                    icon={<UserOutlined />}
                  />
                </Col>
                <Col>
                  <Title level={4} style={{ margin: 0 }}>
                    {`${selectedChild.firstName} ${selectedChild.lastName}`}
                  </Title>
                  <Text type="secondary">{t.selectedForCheckIn}</Text>
                </Col>
              </Row>
            </Card>
          )}

          <Form.Item
            label={t.deliveredByOptional}
            name="deliveredBy"
          >
            <Select
              placeholder={selectedChild ? t.deliveredByPlaceholder : t.firstSelectChild}
              allowClear
              showSearch
              optionFilterProp="children"
              disabled={!selectedChild}
              loading={loadingAuthorizedPersons}
              filterOption={(input, option) =>
                String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={(authorizedPersons || []).map((person) => ({
                label: `${person.name} (${person.relationship})`,
                value: person.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label={t.checkInNotesOptional}
            name="checkInNotes"
          >
            <TextArea
              rows={3}
              placeholder={t.checkInNotesPlaceholder}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={checkingIn}
              size="large"
              icon={<LoginOutlined />}
              block
            >
              {t.registerCheckIn}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "checkout",
      label: (
        <Space>
          <LogoutOutlined />
          {t.checkOut}
        </Space>
      ),
      children: (
        <Form layout="vertical" onFinish={handleCheckOut}>
          <Form.Item
            label={t.selectChild}
            name="childId"
            rules={[{ required: true, message: t.selectChildRequired }]}
          >
            <Select
              placeholder={t.searchChild}
              showSearch
              optionFilterProp="children"
              onChange={handleChildSelect}
              filterOption={(input, option) =>
                String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={(children || []).map((child: any) => ({
                label: `${child.firstName} ${child.lastName}`,
                value: child.id,
              }))}
            />
          </Form.Item>

          {selectedChild && (
            <Card style={{ marginBottom: 16 }}>
              <Row align="middle" gutter={16}>
                <Col>
                  <Avatar
                    size={64}
                    src={selectedChild.profilePicture}
                    icon={<UserOutlined />}
                  />
                </Col>
                <Col>
                  <Title level={4} style={{ margin: 0 }}>
                    {`${selectedChild.firstName} ${selectedChild.lastName}`}
                  </Title>
                  <Text type="secondary">{t.selectedForCheckOut}</Text>
                </Col>
              </Row>
            </Card>
          )}

          <Form.Item
            label={t.pickedUpBy}
            name="pickedUpBy"
            rules={[{ required: true, message: t.pickedUpByRequired }]}
          >
            <Select
              placeholder={selectedChild ? t.pickedUpByPlaceholder : t.firstSelectChild}
              showSearch
              optionFilterProp="children"
              disabled={!selectedChild}
              loading={loadingAuthorizedPersons}
              filterOption={(input, option) =>
                String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={(authorizedPersons || []).map((person) => ({
                label: `${person.name} (${person.relationship})`,
                value: person.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label={t.checkOutNotesRequiredLabel}
            name="checkOutNotes"
            rules={[{ required: true, message: t.checkOutNotesRequired }]}
          >
            <TextArea
              rows={4}
              placeholder={t.checkOutNotesPlaceholder}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={checkingOut}
              size="large"
              icon={<LogoutOutlined />}
              block
              danger
            >
              {t.registerCheckOut}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  if (loadingChildren) {
    return (
      <Create
        title={t.title}
        breadcrumb={false}
        headerButtons={<></>}
        // saveButtonProps={{ style: { display: 'none' } }} // Comentado: el check-in y check-out tienen sus propios botones
        saveButtonProps={{ style: { display: 'none' } }}
      >
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>{t.loadingData}</Text>
            </div>
          </div>
        </Card>
      </Create>
    );
  }

  return (
    <Create
      title={t.title}
      breadcrumb={false}
      headerButtons={<></>}
      // saveButtonProps={{ style: { display: 'none' } }} // Comentado: el check-in y check-out tienen sus propios botones
      saveButtonProps={{ style: { display: 'none' } }}
    >
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </Create>
  );
};

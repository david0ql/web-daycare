import React, { useState } from "react";
import { useList } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Select, Input, Button, Card, Space, Avatar, Typography, Row, Col, Tabs, message, Spin } from "antd";
import { UserOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { useCheckIn, useCheckOut } from "../../domains/attendance";
import { useAuthorizedPickupPersons } from "../../domains/children";
import { axiosInstance } from "../../shared";

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

export const AttendanceCreate: React.FC = () => {
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
        message.success("Check-in exitoso. El niño ha sido registrado correctamente.");
        setSelectedChild(null);
      },
      onError: (error: any) => {
        message.error("Error en check-in: " + (error?.response?.data?.message || "No se pudo registrar el check-in"));
      }
    });
  };

  const handleCheckOut = (values: any) => {
    if (!values.pickedUpBy) {
      message.error("Debe especificar quién recoge al niño");
      return;
    }
    if (!values.checkOutNotes) {
      message.error("Las notas de salida son obligatorias");
      return;
    }
    
    checkOut({
      childId: values.childId,
      pickedUpBy: values.pickedUpBy,
      notes: values.checkOutNotes,
    }, {
      onSuccess: () => {
        message.success("Check-out exitoso. El niño ha sido registrado para salida correctamente.");
        setSelectedChild(null);
      },
      onError: (error: any) => {
        message.error("Error en check-out: " + (error?.response?.data?.message || "No se pudo registrar el check-out"));
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
          Check-in
        </Space>
      ),
      children: (
        <Form layout="vertical" onFinish={handleCheckIn}>
          <Form.Item
            label="Seleccionar Niño"
            name="childId"
            rules={[{ required: true, message: "Debe seleccionar un niño" }]}
          >
            <Select
              placeholder="Buscar y seleccionar niño"
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
                  <Text type="secondary">Seleccionado para check-in</Text>
                </Col>
              </Row>
            </Card>
          )}

          <Form.Item
            label="Entregado por (Opcional)"
            name="deliveredBy"
          >
            <Select
              placeholder={selectedChild ? "¿Quién entrega al niño?" : "Primero seleccione un niño"}
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
            label="Notas de Entrada (Opcional)"
            name="checkInNotes"
          >
            <TextArea
              rows={3}
              placeholder="Observaciones sobre el estado del niño al llegar..."
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
              Registrar Check-in
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
          Check-out
        </Space>
      ),
      children: (
        <Form layout="vertical" onFinish={handleCheckOut}>
          <Form.Item
            label="Seleccionar Niño"
            name="childId"
            rules={[{ required: true, message: "Debe seleccionar un niño" }]}
          >
            <Select
              placeholder="Buscar y seleccionar niño"
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
                  <Text type="secondary">Seleccionado para check-out</Text>
                </Col>
              </Row>
            </Card>
          )}

          <Form.Item
            label="Recogido por"
            name="pickedUpBy"
            rules={[{ required: true, message: "Debe especificar quién recoge al niño" }]}
          >
            <Select
              placeholder={selectedChild ? "¿Quién recoge al niño?" : "Primero seleccione un niño"}
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
            label="Notas de Salida (Obligatorias)"
            name="checkOutNotes"
            rules={[{ required: true, message: "Las notas de salida son obligatorias" }]}
          >
            <TextArea
              rows={4}
              placeholder="Resumen del día del niño, comportamiento, actividades realizadas, comidas, etc..."
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
              Registrar Check-out
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  if (loadingChildren) {
    return (
      <Create
        title="Gestión de Asistencia"
        breadcrumb={false}
        headerButtons={<></>}
        // saveButtonProps={{ style: { display: 'none' } }} // Comentado: el check-in y check-out tienen sus propios botones
        saveButtonProps={{ style: { display: 'none' } }}
      >
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Cargando datos...</Text>
            </div>
          </div>
        </Card>
      </Create>
    );
  }

  return (
    <Create
      title="Gestión de Asistencia"
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

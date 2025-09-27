import React, { useState } from "react";
import { useList, useCustomMutation } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Select, Input, Button, Card, Space, Avatar, Typography, Row, Col, Tabs, message } from "antd";
import { UserOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";

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

  // Get children for selection
  const { data: childrenData } = useList<Child>({
    resource: "children",
    pagination: { pageSize: 150 },
  });

  // Get users for delivered/picked up by selection
  const { data: usersData } = useList<User>({
    resource: "users",
    pagination: { pageSize: 150 },
  });

  // Check-in mutation
  const { mutate: checkIn, isLoading: checkingIn } = useCustomMutation({
    url: "/attendance/check-in",
    method: "post",
    successNotification: {
      message: "Check-in exitoso",
      description: "El niño ha sido registrado correctamente",
      type: "success",
    },
    errorNotification: {
      message: "Error en check-in",
      description: "No se pudo registrar el check-in",
      type: "error",
    },
  });

  // Check-out mutation
  const { mutate: checkOut, isLoading: checkingOut } = useCustomMutation({
    url: "/attendance/check-out",
    method: "post",
    successNotification: {
      message: "Check-out exitoso",
      description: "El niño ha sido registrado para salida correctamente",
      type: "success",
    },
    errorNotification: {
      message: "Error en check-out",
      description: "No se pudo registrar el check-out",
      type: "error",
    },
  });

  // Filter active children and users on the frontend since API doesn't support these filters
  const children = (childrenData?.data || []).filter((child: any) => child.isActive === true);
  const users = (usersData?.data || []).filter((user: any) => user.isActive === true);

  const handleCheckIn = (values: any) => {
    checkIn({
      childId: values.childId,
      deliveredBy: values.deliveredBy,
      checkInNotes: values.checkInNotes,
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
      checkOutNotes: values.checkOutNotes,
    });
  };

  const handleChildSelect = (childId: number) => {
    const child = children.find((c) => c.id === childId);
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
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={children.map((child) => ({
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
              placeholder="¿Quién entrega al niño?"
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={users.map((user) => ({
                label: `${user.firstName} ${user.lastName}`,
                value: user.id,
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
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={children.map((child) => ({
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
              placeholder="¿Quién recoge al niño?"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={users.map((user) => ({
                label: `${user.firstName} ${user.lastName}`,
                value: user.id,
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

  return (
    <Create
      title="Gestión de Asistencia"
      breadcrumb={false}
      headerButtons={<></>}
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

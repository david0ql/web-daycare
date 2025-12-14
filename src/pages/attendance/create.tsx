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
        message.success("Check-in successful. The child has been registered correctly.");
        setSelectedChild(null);
      },
      onError: (error: any) => {
        message.error("Check-in error: " + (error?.response?.data?.message || "Could not register check-in"));
      }
    });
  };

  const handleCheckOut = (values: any) => {
    if (!values.pickedUpBy) {
      message.error("You must specify who picks up the child");
      return;
    }
    if (!values.checkOutNotes) {
      message.error("Check-out notes are required");
      return;
    }
    
    checkOut({
      childId: values.childId,
      pickedUpBy: values.pickedUpBy,
      notes: values.checkOutNotes,
    }, {
      onSuccess: () => {
        message.success("Check-out successful. The child has been registered for departure correctly.");
        setSelectedChild(null);
      },
      onError: (error: any) => {
        message.error("Check-out error: " + (error?.response?.data?.message || "Could not register check-out"));
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
                  <Text type="secondary">Selected for check-in</Text>
                </Col>
              </Row>
            </Card>
          )}

          <Form.Item
            label="Delivered by (Optional)"
            name="deliveredBy"
          >
            <Select
              placeholder={selectedChild ? "Who delivers the child?" : "First select a child"}
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
            label="Check-in Notes (Optional)"
            name="checkInNotes"
          >
            <TextArea
              rows={3}
              placeholder="Observations about the child's condition upon arrival..."
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
              Register Check-in
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
                  <Text type="secondary">Selected for check-out</Text>
                </Col>
              </Row>
            </Card>
          )}

          <Form.Item
            label="Picked up by"
            name="pickedUpBy"
            rules={[{ required: true, message: "You must specify who picks up the child" }]}
          >
            <Select
              placeholder={selectedChild ? "Who picks up the child?" : "First select a child"}
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
            label="Check-out Notes (Required)"
            name="checkOutNotes"
            rules={[{ required: true, message: "Check-out notes are required" }]}
          >
            <TextArea
              rows={4}
              placeholder="Summary of the child's day, behavior, activities performed, meals, etc..."
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
              Register Check-out
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  if (loadingChildren) {
    return (
      <Create
        title="Attendance Management"
        breadcrumb={false}
        headerButtons={<></>}
        // saveButtonProps={{ style: { display: 'none' } }} // Comentado: el check-in y check-out tienen sus propios botones
        saveButtonProps={{ style: { display: 'none' } }}
      >
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Loading data...</Text>
            </div>
          </div>
        </Card>
      </Create>
    );
  }

  return (
    <Create
      title="Attendance Management"
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

import React from "react";
import { Show, TextField, DateField, BooleanField } from "@refinedev/antd";
import { Typography, Space, Tag, Avatar, Card, Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ChildUtils } from "../../domains/children/utils/child.utils";

const { Title, Text } = Typography;

export const ChildShow: React.FC = () => {
  return (
    <Show title="Child Details">
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space align="center" size="large">
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  <TextField value="firstName" /> <TextField value="lastName" />
                </Title>
                <Text type="secondary">
                  {ChildUtils.getAgeDisplay("birthDate")}
                </Text>
              </div>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card size="small" title="Personal Information">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Birth Date:</Text>
                  <br />
                  <DateField value="birthDate" format="YYYY-MM-DD" />
                </div>
                <div>
                  <Text strong>Birth City:</Text>
                  <br />
                  <TextField value="birthCity" />
                </div>
                <div>
                  <Text strong>Address:</Text>
                  <br />
                  <TextField value="address" />
                </div>
              </Space>
            </Card>
          </Col>

          <Col span={12}>
            <Card size="small" title="Status">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Payment Status:</Text>
                  <br />
                  <Tag color={ChildUtils.getPaymentAlertColor(false)}>
                    <BooleanField value="hasPaymentAlert" />
                  </Tag>
                </div>
                <div>
                  <Text strong>Active Status:</Text>
                  <br />
                  <Tag color={ChildUtils.getActiveStatusColor(true)}>
                    <BooleanField value="isActive" />
                  </Tag>
                </div>
                <div>
                  <Text strong>Registration Date:</Text>
                  <br />
                  <DateField value="createdAt" format="YYYY-MM-DD HH:mm" />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </Show>
  );
};
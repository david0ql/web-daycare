import React from "react";
import { Show, TextField, DateField, BooleanField } from "@refinedev/antd";
import { Typography, Space, Tag, Avatar, Card, Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ChildUtils } from "../../domains/children/utils/child.utils";

const { Title, Text } = Typography;

export const ChildShow: React.FC = () => {
  return (
    <Show>
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
            <Card size="small" title="Información Personal">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Fecha de Nacimiento:</Text>
                  <br />
                  <DateField value="birthDate" format="YYYY-MM-DD" />
                </div>
                <div>
                  <Text strong>Ciudad de Nacimiento:</Text>
                  <br />
                  <TextField value="birthCity" />
                </div>
                <div>
                  <Text strong>Dirección:</Text>
                  <br />
                  <TextField value="address" />
                </div>
              </Space>
            </Card>
          </Col>

          <Col span={12}>
            <Card size="small" title="Estado">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Estado de Pago:</Text>
                  <br />
                  <Tag color={ChildUtils.getPaymentAlertColor(false)}>
                    <BooleanField value="hasPaymentAlert" />
                  </Tag>
                </div>
                <div>
                  <Text strong>Estado Activo:</Text>
                  <br />
                  <Tag color={ChildUtils.getActiveStatusColor(true)}>
                    <BooleanField value="isActive" />
                  </Tag>
                </div>
                <div>
                  <Text strong>Fecha de Registro:</Text>
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
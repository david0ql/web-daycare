import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Card, Typography, Space, Alert, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { colors } from "../styles/colors";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const { mutate: login, isLoading, error } = useLogin();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onFinish = (values: { email: string; password: string }) => {
    setLoginError(null);
    login(values, {
      onError: (error: any) => {
        setLoginError(error?.message || "Error al iniciar sesión");
      },
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: colors.gradients.background,
      }}
    >
      <Card
        style={{
          width: 400,
          padding: "32px",
          boxShadow: colors.shadows.lg,
          borderRadius: "12px",
          border: `1px solid ${colors.border.light}`,
          background: colors.background.primary,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title level={2} style={{ color: colors.text.primary, marginBottom: "8px" }}>
            🏫 The Children's World
          </Title>
          <Text type="secondary" style={{ color: colors.text.secondary }}>Sistema de Gestión de Guardería</Text>
        </div>

        {(error || loginError) && (
          <Alert
            message="Error de autenticación"
            description={loginError || "Credenciales incorrectas. Verifica tu email y contraseña."}
            type="error"
            style={{ marginBottom: "16px" }}
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Por favor ingresa tu email" },
              { type: "email", message: "Ingresa un email válido" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="tu@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: "Por favor ingresa tu contraseña" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Tu contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              block
              style={{ 
                background: colors.primary.main,
                borderColor: colors.primary.main,
                height: "40px",
                fontWeight: 500,
              }}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Text type="secondary" style={{ color: colors.text.secondary }}>
            Contacta al administrador para obtener acceso
          </Text>
        </div>
      </Card>
    </div>
  );
};

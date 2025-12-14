import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Card, Typography, Space, Alert, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { colors } from "../styles/colors";
import { AuthApi } from "../domains/auth";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const { mutate: login, isPending, error } = useLogin();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoginError(null);
    setIsLoading(true);
    console.log("🚀 Login form submitted with:", { email: values.email });
    
    try {
      // Usar AuthApi directamente para evitar problemas con useLogin
      console.log("📡 Calling AuthApi.login() directly...");
      const data = await AuthApi.login(values);
      console.log("✅ AuthApi.login() success:", data);
      
      // Guardar token y usuario
      localStorage.setItem("refine-auth", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      console.log("💾 Token and user saved, redirecting...");
      
      // Redirigir al dashboard
      window.location.href = "/";
      
    } catch (error: any) {
      console.error("❌ Login error:", error);
      setLoginError(error.response?.data?.message || error.message || "Error signing in");
    } finally {
      setIsLoading(false);
    }
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
          <Text type="secondary" style={{ color: colors.text.secondary }}>Daycare Management System</Text>
        </div>

        {(error || loginError) && (
          <Alert
            message="Authentication Error"
            description={loginError || "Incorrect credentials. Please verify your email and password."}
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
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
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
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Your password"
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
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

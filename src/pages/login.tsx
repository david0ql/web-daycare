import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Card, Typography, Space, Alert, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { colors } from "../styles/colors";
import { AuthApi } from "../domains/auth";
import { useLanguage } from "../shared/contexts/language.context";

const { Title, Text } = Typography;

const LOGIN_TRANSLATIONS = {
  english: {
    systemName: "Daycare Management System",
    authError: "Authentication Error",
    incorrectCredentials: "Incorrect credentials. Please verify your email and password.",
    email: "Email",
    emailRequired: "Please enter your email",
    emailInvalid: "Please enter a valid email",
    emailPlaceholder: "your@email.com",
    password: "Password",
    passwordRequired: "Please enter your password",
    passwordPlaceholder: "Your password",
    signIn: "Sign In",
    genericError: "Error signing in",
  },
  spanish: {
    systemName: "Sistema de gestión de guardería",
    authError: "Error de autenticación",
    incorrectCredentials: "Credenciales incorrectas. Por favor verifica tu correo y contraseña.",
    email: "Correo electrónico",
    emailRequired: "Por favor ingresa tu correo",
    emailInvalid: "Por favor ingresa un correo válido",
    emailPlaceholder: "tu@email.com",
    password: "Contraseña",
    passwordRequired: "Por favor ingresa tu contraseña",
    passwordPlaceholder: "Tu contraseña",
    signIn: "Iniciar sesión",
    genericError: "Error al iniciar sesión",
  },
} as const;

export const Login: React.FC = () => {
  const { mutate: login, isPending, error } = useLogin();
  const { language } = useLanguage();
  const t = LOGIN_TRANSLATIONS[language];
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
      setLoginError(error.response?.data?.message || error.message || t.genericError);
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
          <Text type="secondary" style={{ color: colors.text.secondary }}>{t.systemName}</Text>
        </div>

        {(error || loginError) && (
          <Alert
            message={t.authError}
            description={loginError || t.incorrectCredentials}
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
            label={t.email}
            rules={[
              { required: true, message: t.emailRequired },
              { type: "email", message: t.emailInvalid },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t.emailPlaceholder}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t.password}
            rules={[
              { required: true, message: t.passwordRequired },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t.passwordPlaceholder}
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
              {t.signIn}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

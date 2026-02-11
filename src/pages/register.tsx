import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Space, Alert, Select, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../styles/phone-input.css';
import { colors } from "../styles/colors";
import { axiosInstance } from "../shared";
import { useLanguage } from "../shared/contexts/language.context";

const { Title, Text } = Typography;

const REGISTER_TRANSLATIONS = {
  english: {
    subtitle: "Create new account",
    successMessage: "Account created successfully. You can now sign in.",
    connectionError: "Connection error. Please verify that the API is working.",
    regError: "Registration Error",
    regErrorDesc: "Could not create account. Please verify the entered data.",
    email: "Email",
    emailRequired: "Please enter your email",
    emailInvalid: "Please enter a valid email",
    emailPlaceholder: "your@email.com",
    password: "Password",
    passwordRequired: "Please enter your password",
    passwordMin: "Password must be at least 6 characters",
    passwordPlaceholder: "Your password",
    firstName: "First Name",
    firstNameRequired: "Please enter your first name",
    firstNamePlaceholder: "Your first name",
    lastName: "Last Name",
    lastNameRequired: "Please enter your last name",
    lastNamePlaceholder: "Your last name",
    phoneOptional: "Phone (Optional)",
    phonePlaceholder: "Enter your phone number",
    userType: "User Type",
    userTypeRequired: "Please select your user type",
    userTypePlaceholder: "Select your role",
    roleParent: "Parent",
    roleEducator: "Educator",
    roleAdministrator: "Administrator",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    signInHere: "Sign in here",
  },
  spanish: {
    subtitle: "Crear nueva cuenta",
    successMessage: "Cuenta creada correctamente. Ya puedes iniciar sesión.",
    connectionError: "Error de conexión. Por favor verifica que la API esté funcionando.",
    regError: "Error de registro",
    regErrorDesc: "No se pudo crear la cuenta. Por favor verifica los datos ingresados.",
    email: "Correo electrónico",
    emailRequired: "Por favor ingresa tu correo",
    emailInvalid: "Por favor ingresa un correo válido",
    emailPlaceholder: "tu@email.com",
    password: "Contraseña",
    passwordRequired: "Por favor ingresa tu contraseña",
    passwordMin: "La contraseña debe tener al menos 6 caracteres",
    passwordPlaceholder: "Tu contraseña",
    firstName: "Nombre",
    firstNameRequired: "Por favor ingresa tu nombre",
    firstNamePlaceholder: "Tu nombre",
    lastName: "Apellido",
    lastNameRequired: "Por favor ingresa tu apellido",
    lastNamePlaceholder: "Tu apellido",
    phoneOptional: "Teléfono (Opcional)",
    phonePlaceholder: "Ingresa tu número de teléfono",
    userType: "Tipo de usuario",
    userTypeRequired: "Por favor selecciona tu tipo de usuario",
    userTypePlaceholder: "Selecciona tu rol",
    roleParent: "Padre/Madre",
    roleEducator: "Educador",
    roleAdministrator: "Administrador",
    createAccount: "Crear cuenta",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    signInHere: "Inicia sesión aquí",
  },
} as const;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = REGISTER_TRANSLATIONS[language];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState<string | undefined>();

  const onFinish = async (values: any) => {
    setIsLoading(true);
    setError(null);
    
    // Add phone value to the form data
    const formData = {
      ...values,
      phone: phoneValue
    };
    
    try {
      const response = await axiosInstance.post("/auth/register", formData);
      message.success(t.successMessage);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || t.connectionError);
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
          width: 500,
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
          <Text type="secondary" style={{ color: colors.text.secondary }}>{t.subtitle}</Text>
        </div>

        {error && (
          <Alert
            message={t.regError}
            description={t.regErrorDesc}
            type="error"
            style={{ marginBottom: "16px" }}
          />
        )}

        <Form
          name="register"
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
              prefix={<MailOutlined />}
              placeholder={t.emailPlaceholder}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t.password}
            rules={[
              { required: true, message: t.passwordRequired },
              { min: 6, message: t.passwordMin },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t.passwordPlaceholder}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="firstName"
            label={t.firstName}
            rules={[
              { required: true, message: t.firstNameRequired },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t.firstNamePlaceholder}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={t.lastName}
            rules={[
              { required: true, message: t.lastNameRequired },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t.lastNamePlaceholder}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={t.phoneOptional}
            style={{ marginBottom: 0 }}
          >
            <div style={{ position: 'relative' }}>
              <PhoneInput
                value={phoneValue}
                onChange={setPhoneValue}
                placeholder={t.phonePlaceholder}
                defaultCountry="US"
                className="custom-phone-input"
                international
                countryCallingCodeEditable={false}
                addInternationalOption={false}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="role"
            label={t.userType}
            rules={[
              { required: true, message: t.userTypeRequired },
            ]}
          >
            <Select
              placeholder={t.userTypePlaceholder}
              size="large"
              options={[
                { label: t.roleParent, value: "parent" },
                { label: t.roleEducator, value: "educator" },
                { label: t.roleAdministrator, value: "administrator" },
              ]}
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
              {t.createAccount}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Text type="secondary" style={{ color: colors.text.secondary }}>
            {t.alreadyHaveAccount}{" "}
            <Button type="link" href="/login" style={{ padding: 0, color: colors.secondary.main }}>
              {t.signInHere}
            </Button>
          </Text>
        </div>
      </Card>
    </div>
  );
};

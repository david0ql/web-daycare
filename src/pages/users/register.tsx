import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Alert, Select, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { usePermissions } from "@refinedev/core";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../styles/phone-input.css';
import { colors } from "../../styles/colors";
import { axiosInstance } from "../../shared";
import { useLanguage } from "../../shared/contexts/language.context";

const { Title, Text } = Typography;

const REGISTER_TRANSLATIONS = {
  english: {
    createUser: "Create New User",
    registerDesc: "Register a new account in the system",
    back: "Back",
    backToUsers: "Back to Users",
    accessDenied: "Access Denied",
    accessDeniedDesc: "Only administrators can create new user accounts.",
    regError: "Registration Error",
    regErrorDesc: "Could not create account. Please check the entered data.",
    successMessage: "Account created successfully. You can now log in.",
    connectionError: "Connection error. Please verify that the API is running.",
    createAccount: "Create Account",
    credentialsNote: "The user will receive credentials by email",
    email: "Email",
    emailRequired: "Please enter your email",
    emailInvalid: "Enter a valid email",
    emailPlaceholder: "your@email.com",
    password: "Password",
    passwordRequired: "Please enter your password",
    passwordMin: "Password must be at least 6 characters long",
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
    userTypeRequired: "Please select user type",
    userTypePlaceholder: "Select user role",
  },
  spanish: {
    createUser: "Crear nuevo usuario",
    registerDesc: "Registrar una nueva cuenta en el sistema",
    back: "Volver",
    backToUsers: "Volver a usuarios",
    accessDenied: "Acceso denegado",
    accessDeniedDesc: "Solo los administradores pueden crear nuevas cuentas de usuario.",
    regError: "Error de registro",
    regErrorDesc: "No se pudo crear la cuenta. Por favor verifique los datos.",
    successMessage: "Cuenta creada correctamente. Ya puede iniciar sesión.",
    connectionError: "Error de conexión. Por favor verifica que la API esté en ejecución.",
    createAccount: "Crear cuenta",
    credentialsNote: "El usuario recibirá las credenciales por correo electrónico",
    email: "Correo electrónico",
    emailRequired: "Por favor ingresa tu correo",
    emailInvalid: "Ingresa un correo válido",
    emailPlaceholder: "tu@email.com",
    password: "Contraseña",
    passwordRequired: "Por favor ingresa tu contraseña",
    passwordMin: "La contraseña debe tener al menos 6 caracteres",
    passwordPlaceholder: "Tu contraseña",
    firstName: "Nombre",
    firstNameRequired: "Por favor ingresa el nombre",
    firstNamePlaceholder: "Nombre",
    lastName: "Apellido",
    lastNameRequired: "Por favor ingresa el apellido",
    lastNamePlaceholder: "Apellido",
    phoneOptional: "Teléfono (Opcional)",
    phonePlaceholder: "Ingresa el número de teléfono",
    userType: "Tipo de usuario",
    userTypeRequired: "Por favor selecciona el tipo de usuario",
    userTypePlaceholder: "Selecciona el rol del usuario",
  },
} as const;

interface Role {
  id: number;
  name: string;
  description: string | null;
  createdAt: string | null;
}

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = REGISTER_TRANSLATIONS[language];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState<string | undefined>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const { data: permissions } = usePermissions({});

  // Verificar si el usuario es administrador
  const isAdmin = permissions?.includes("administrator");

  // Cargar roles al montar el componente
  useEffect(() => {
    const loadRoles = async () => {
      if (!isAdmin) return;
      
      setLoadingRoles(true);
      try {
        const response = await axiosInstance.get("/roles");
        setRoles(response.data);
      } catch (error) {
        console.error("Error loading roles:", error);
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();
  }, [isAdmin]);

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

  if (!isAdmin) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Alert
          message={t.accessDenied}
          description={t.accessDeniedDesc}
          type="warning"
          showIcon
          style={{ marginBottom: "16px" }}
        />
        <Button onClick={() => navigate("/users")} icon={<ArrowLeftOutlined />}>
          {t.backToUsers}
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        style={{ 
          background: colors.background.primary,
          marginBottom: "24px",
          borderRadius: "8px",
          border: `1px solid ${colors.border.light}`,
          boxShadow: colors.shadows.sm
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/users")}
            style={{ marginRight: '16px' }}
          >
            {t.back}
          </Button>
          <div>
            <Title level={3} style={{ margin: 0, color: colors.text.primary }}>
              {t.createUser}
            </Title>
            <Text type="secondary" style={{ color: colors.text.secondary }}>
              {t.registerDesc}
            </Text>
          </div>
        </div>
      </Card>
      
      <Card
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "32px",
          boxShadow: colors.shadows.lg,
          borderRadius: "12px",
          border: `1px solid ${colors.border.light}`,
          background: colors.background.primary,
        }}
      >

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
            name="roleId"
            label={t.userType}
            rules={[
              { required: true, message: t.userTypeRequired },
            ]}
          >
            <Select
              placeholder={t.userTypePlaceholder}
              size="large"
              loading={loadingRoles}
              options={roles.map(role => ({
                label: role.description || role.name,
                value: role.id,
              }))}
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
            {t.credentialsNote}
          </Text>
        </div>
      </Card>
    </div>
  );
};

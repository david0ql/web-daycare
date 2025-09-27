import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Space, Alert, Select, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../styles/phone-input.css';
import { colors } from "../styles/colors";
import { axiosInstance } from "../shared";

const { Title, Text } = Typography;

export const Register: React.FC = () => {
  const navigate = useNavigate();
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
      message.success("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error de conexión. Verifica que la API esté funcionando.");
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
          <Text type="secondary" style={{ color: colors.text.secondary }}>Crear nueva cuenta</Text>
        </div>

        {error && (
          <Alert
            message="Error en el registro"
            description="No se pudo crear la cuenta. Verifica los datos ingresados."
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
            label="Email"
            rules={[
              { required: true, message: "Por favor ingresa tu email" },
              { type: "email", message: "Ingresa un email válido" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="tu@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: "Por favor ingresa tu contraseña" },
              { min: 6, message: "La contraseña debe tener al menos 6 caracteres" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Tu contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="firstName"
            label="Nombre"
            rules={[
              { required: true, message: "Por favor ingresa tu nombre" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tu nombre"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Apellido"
            rules={[
              { required: true, message: "Por favor ingresa tu apellido" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tu apellido"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Teléfono (Opcional)"
            style={{ marginBottom: 0 }}
          >
            <div style={{ position: 'relative' }}>
              <PhoneInput
                value={phoneValue}
                onChange={setPhoneValue}
                placeholder="Ingresa tu número de teléfono"
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
            label="Tipo de Usuario"
            rules={[
              { required: true, message: "Por favor selecciona tu tipo de usuario" },
            ]}
          >
            <Select
              placeholder="Selecciona tu rol"
              size="large"
              options={[
                { label: "Padre/Madre", value: "parent" },
                { label: "Educador", value: "educator" },
                { label: "Administrador", value: "administrator" },
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
              Crear Cuenta
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Text type="secondary" style={{ color: colors.text.secondary }}>
            ¿Ya tienes cuenta?{" "}
            <Button type="link" href="/login" style={{ padding: 0, color: colors.secondary.main }}>
              Inicia sesión aquí
            </Button>
          </Text>
        </div>
      </Card>
    </div>
  );
};

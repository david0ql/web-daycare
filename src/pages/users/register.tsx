import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Space, Alert, Select, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { usePermissions } from "@refinedev/core";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../styles/phone-input.css';
import { colors } from "../../styles/colors";

const { Title, Text } = Typography;

interface Role {
  id: number;
  name: string;
  description: string | null;
  createdAt: string | null;
}

export const Register: React.FC = () => {
  const navigate = useNavigate();
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
        const token = localStorage.getItem("refine-auth");
        const response = await fetch("http://localhost:30000/api/roles", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const rolesData = await response.json();
          setRoles(rolesData);
        } else {
          console.error("Error loading roles:", response.statusText);
        }
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
      const response = await fetch("http://localhost:30000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        message.success("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
        navigate("/login");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al crear la cuenta");
      }
    } catch (err) {
      setError("Error de conexión. Verifica que la API esté funcionando.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si no es administrador, mostrar mensaje de acceso denegado
  if (!isAdmin) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Alert
          message="Acceso Denegado"
          description="Solo los administradores pueden crear nuevas cuentas de usuario."
          type="warning"
          showIcon
          style={{ marginBottom: "16px" }}
        />
        <Button onClick={() => navigate("/users")} icon={<ArrowLeftOutlined />}>
          Volver a Usuarios
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
            Volver
          </Button>
          <div>
            <Title level={3} style={{ margin: 0, color: colors.text.primary }}>
              Crear Nuevo Usuario
            </Title>
            <Text type="secondary" style={{ color: colors.text.secondary }}>
              Registrar una nueva cuenta en el sistema
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
            name="roleId"
            label="Tipo de Usuario"
            rules={[
              { required: true, message: "Por favor selecciona el tipo de usuario" },
            ]}
          >
            <Select
              placeholder="Selecciona el rol del usuario"
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
              Crear Cuenta
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Text type="secondary" style={{ color: colors.text.secondary }}>
            El usuario recibirá las credenciales por email
          </Text>
        </div>
      </Card>
    </div>
  );
};

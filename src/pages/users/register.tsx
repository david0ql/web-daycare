import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Space, Alert, Select, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { usePermissions } from "@refinedev/core";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../styles/phone-input.css';
import { colors } from "../../styles/colors";
import { axiosInstance } from "../../shared";

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
      message.success("Account created successfully. You can now log in.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Connection error. Please verify that the API is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si no es administrador, mostrar mensaje de acceso denegado
  if (!isAdmin) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Alert
          message="Access Denied"
          description="Only administrators can create new user accounts."
          type="warning"
          showIcon
          style={{ marginBottom: "16px" }}
        />
        <Button onClick={() => navigate("/users")} icon={<ArrowLeftOutlined />}>
          Back to Users
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
            Back
          </Button>
          <div>
            <Title level={3} style={{ margin: 0, color: colors.text.primary }}>
              Create New User
            </Title>
            <Text type="secondary" style={{ color: colors.text.secondary }}>
              Register a new account in the system
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
            message="Registration Error"
            description="Could not create account. Please check the entered data."
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
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters long" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Your password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="firstName"
            label="First Name"
            rules={[
              { required: true, message: "Please enter your first name" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Your first name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[
              { required: true, message: "Please enter your last name" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Your last name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Phone (Optional)"
            style={{ marginBottom: 0 }}
          >
            <div style={{ position: 'relative' }}>
              <PhoneInput
                value={phoneValue}
                onChange={setPhoneValue}
                placeholder="Enter your phone number"
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
            label="User Type"
            rules={[
              { required: true, message: "Please select user type" },
            ]}
          >
            <Select
              placeholder="Select user role"
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
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Text type="secondary" style={{ color: colors.text.secondary }}>
            The user will receive credentials by email
          </Text>
        </div>
      </Card>
    </div>
  );
};

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
      message.success("Account created successfully. You can now sign in.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Connection error. Please verify that the API is working.");
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
          <Text type="secondary" style={{ color: colors.text.secondary }}>Create new account</Text>
        </div>

        {error && (
          <Alert
            message="Registration Error"
            description="Could not create account. Please verify the entered data."
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
              { type: "email", message: "Please enter a valid email" },
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
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters" },
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
            name="role"
            label="User Type"
            rules={[
              { required: true, message: "Please select your user type" },
            ]}
          >
            <Select
              placeholder="Select your role"
              size="large"
              options={[
                { label: "Parent", value: "parent" },
                { label: "Educator", value: "educator" },
                { label: "Administrator", value: "administrator" },
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
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Text type="secondary" style={{ color: colors.text.secondary }}>
            Already have an account?{" "}
            <Button type="link" href="/login" style={{ padding: 0, color: colors.secondary.main }}>
              Sign in here
            </Button>
          </Text>
        </div>
      </Card>
    </div>
  );
};

import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { colors } from "../styles/colors";

export const Error404: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: colors.gradients.background,
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Result
          status="404"
          title={
            <span style={{ 
              color: colors.text.primary,
              fontSize: "48px",
              fontWeight: "bold"
            }}>
              404
            </span>
          }
          subTitle={
            <div style={{ color: colors.text.secondary }}>
              <div style={{ fontSize: "24px", marginBottom: "16px" }}>
                🏫 Page Not Found
              </div>
              <div style={{ fontSize: "16px", lineHeight: "1.6" }}>
                Sorry, the page you are looking for does not exist or has been moved.
                <br />
                Please verify the URL or return to the main page.
              </div>
            </div>
          }
          extra={[
            <Button
              key="home"
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={handleGoHome}
              style={{
                background: colors.primary.main,
                borderColor: colors.primary.main,
                height: "48px",
                paddingLeft: "24px",
                paddingRight: "24px",
                fontSize: "16px",
                fontWeight: 500,
                marginRight: "12px",
                borderRadius: "8px",
                boxShadow: colors.shadows.md,
              }}
            >
              Go to Dashboard
            </Button>,
            <Button
              key="back"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
              style={{
                height: "48px",
                paddingLeft: "24px",
                paddingRight: "24px",
                fontSize: "16px",
                fontWeight: 500,
                borderRadius: "8px",
                borderColor: colors.border.light,
                color: colors.text.primary,
              }}
            >
              Go Back
            </Button>,
          ]}
        />
        
        {/* Información adicional */}
        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            background: colors.background.primary,
            borderRadius: "12px",
            border: `1px solid ${colors.border.light}`,
            boxShadow: colors.shadows.sm,
          }}
        >
          <div style={{ 
            color: colors.text.secondary,
            fontSize: "14px",
            lineHeight: "1.5"
          }}>
            <strong style={{ color: colors.text.primary }}>
              Need help?
            </strong>
            <br />
            If you believe this is an error, contact the system administrator
            or verify that the URL is correct.
          </div>
        </div>
      </div>
    </div>
  );
};

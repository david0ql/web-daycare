import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { colors } from "../styles/colors";
import { useLanguage } from "../shared/contexts/language.context";

const ERROR_404_TRANSLATIONS = {
  english: {
    pageNotFound: "Page Not Found",
    description1: "Sorry, the page you are looking for does not exist or has been moved.",
    description2: "Please verify the URL or return to the main page.",
    goToDashboard: "Go to Dashboard",
    goBack: "Go Back",
    needHelp: "Need help?",
    helpText: "If you believe this is an error, contact the system administrator or verify that the URL is correct.",
  },
  spanish: {
    pageNotFound: "Página no encontrada",
    description1: "Lo sentimos, la página que buscas no existe o ha sido movida.",
    description2: "Por favor verifica la URL o regresa a la página principal.",
    goToDashboard: "Ir al panel",
    goBack: "Volver",
    needHelp: "¿Necesitas ayuda?",
    helpText: "Si crees que esto es un error, contacta al administrador del sistema o verifica que la URL sea correcta.",
  },
} as const;

export const Error404: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = ERROR_404_TRANSLATIONS[language];

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
                🏫 {t.pageNotFound}
              </div>
              <div style={{ fontSize: "16px", lineHeight: "1.6" }}>
                {t.description1}
                <br />
                {t.description2}
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
              {t.goToDashboard}
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
              {t.goBack}
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
            <strong style={{ color: colors.text.primary }}>{t.needHelp}</strong>
            <br />
            {t.helpText}
          </div>
        </div>
      </div>
    </div>
  );
};

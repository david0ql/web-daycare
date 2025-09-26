import React from "react";
import { LoginForm } from "../components/login.form";
import { colors } from "../../../shared/styles/colors.styles";

export const LoginPage: React.FC = () => {
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
      <LoginForm />
    </div>
  );
};

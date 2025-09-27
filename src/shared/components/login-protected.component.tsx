import React from "react";
import { Authenticated } from "@refinedev/core";
import { Navigate } from "react-router";

interface LoginProtectedProps {
  children: React.ReactNode;
}

/**
 * Componente que protege la página de login usando el componente nativo Authenticated de Refine
 * Si el usuario ya está autenticado, lo redirige al dashboard
 */
export const LoginProtected: React.FC<LoginProtectedProps> = ({ children }) => {
  return (
    <Authenticated fallback={children} redirectOnFail="/">
      <Navigate to="/" replace />
    </Authenticated>
  );
};

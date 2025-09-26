import { useMemo } from "react";
import { 
  useGetIdentity, 
  useLogin, 
  useLogout, 
  usePermissions, 
  useIsAuthenticated,
  useOnError,
  useRegister,
  useForgotPassword,
  useUpdatePassword,
  useNotification
} from "@refinedev/core";

/**
 * Hook personalizado para operaciones de autenticación
 * Implementa las mejores prácticas de Refine para autenticación
 */
export const useAuth = () => {
  // ===== HOOKS BÁSICOS =====
  const { data: user, isLoading: userLoading, refetch: refetchUser } = useGetIdentity();
  const { mutate: login } = useLogin();
  const { mutate: logout } = useLogout();
  const { data: permissions, isLoading: permissionsLoading } = usePermissions({});
  const { data: isAuthenticated, isLoading: authCheckLoading } = useIsAuthenticated();
  const { mutate: onError } = useOnError();
  const { mutate: register } = useRegister();
  const { mutate: forgotPassword } = useForgotPassword();
  const { mutate: updatePassword } = useUpdatePassword();
  const { open: openNotification } = useNotification();

  // ===== FUNCIONES DE AUTENTICACIÓN =====
  
  /**
   * Función para realizar login
   */
  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      if (login) {
        await login(credentials);
        openNotification?.({
          type: "success",
          message: "Inicio de sesión exitoso",
          description: `Bienvenido, ${user?.firstName || "Usuario"}`,
        });
      }
    } catch (error) {
      openNotification?.({
        type: "error",
        message: "Error al iniciar sesión",
        description: "Credenciales inválidas",
      });
      throw error;
    }
  };

  /**
   * Función para realizar logout
   */
  const handleLogout = async () => {
    try {
      if (logout) {
        // Llamar al logout de Refine usando mutate en lugar de await
        logout(undefined, {
          onSuccess: () => {
            openNotification?.({
              type: "success",
              message: "Sesión cerrada",
              description: "Has cerrado sesión correctamente",
            });
          },
          onError: (error) => {
            console.error("Logout error:", error);
            
            // Forzar limpieza local en caso de error
            localStorage.removeItem("refine-auth");
            localStorage.removeItem("user");
            sessionStorage.clear();
            
            openNotification?.({
              type: "error",
              message: "Error al cerrar sesión",
              description: "Se ha cerrado la sesión localmente",
            });
            
            // Redirigir manualmente si es necesario
            window.location.href = "/login";
          }
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      
      // Forzar limpieza local en caso de error
      localStorage.removeItem("refine-auth");
      localStorage.removeItem("user");
      sessionStorage.clear();
      
      openNotification?.({
        type: "error",
        message: "Error al cerrar sesión",
        description: "Se ha cerrado la sesión localmente",
      });
      
      // Redirigir manualmente si es necesario
      window.location.href = "/login";
    }
  };

  /**
   * Función para registro de usuarios
   */
  const handleRegister = async (userData: any) => {
    try {
      if (register) {
        await register(userData);
        openNotification?.({
          type: "success",
          message: "Registro exitoso",
          description: "Usuario registrado correctamente",
        });
      }
    } catch (error) {
      openNotification?.({
        type: "error",
        message: "Error en el registro",
        description: "No se pudo registrar el usuario",
      });
      throw error;
    }
  };

  /**
   * Función para recuperar contraseña
   */
  const handleForgotPassword = async (email: string) => {
    try {
      if (forgotPassword) {
        await forgotPassword({ email });
        openNotification?.({
          type: "success",
          message: "Email enviado",
          description: "Se ha enviado un enlace de recuperación a tu email",
        });
      }
    } catch (error) {
      openNotification?.({
        type: "error",
        message: "Error al enviar email",
        description: "No se pudo enviar el email de recuperación",
      });
      throw error;
    }
  };

  /**
   * Función para actualizar contraseña
   */
  const handleUpdatePassword = async (passwordData: any) => {
    try {
      if (updatePassword) {
        await updatePassword(passwordData);
        openNotification?.({
          type: "success",
          message: "Contraseña actualizada",
          description: "Tu contraseña ha sido actualizada correctamente",
        });
      }
    } catch (error) {
      openNotification?.({
        type: "error",
        message: "Error al actualizar contraseña",
        description: "No se pudo actualizar la contraseña",
      });
      throw error;
    }
  };

  // ===== FUNCIONES DE PERMISOS =====
  
  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    return permissions.includes(permission);
  };

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (role: string): boolean => {
    if (!permissions) return false;
    return permissions === role || permissions.includes(role);
  };

  /**
   * Verifica si el usuario es administrador
   */
  const isAdmin = (): boolean => {
    return hasRole("administrator");
  };

  /**
   * Verifica si el usuario es educador
   */
  const isEducator = (): boolean => {
    return hasRole("educator");
  };

  /**
   * Verifica si el usuario es padre/madre
   */
  const isParent = (): boolean => {
    return hasRole("parent");
  };

  // ===== FUNCIONES DE UTILIDAD =====
  
  /**
   * Obtiene el nombre completo del usuario
   */
  const getUserFullName = (): string => {
    if (!user) return "Usuario";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Usuario";
  };

  /**
   * Obtiene el rol del usuario en formato legible
   */
  const getUserRoleLabel = (): string => {
    if (!permissions) return "Usuario";
    
    switch (permissions) {
      case "administrator":
        return "Administrador";
      case "educator":
        return "Educador";
      case "parent":
        return "Padre/Madre";
      default:
        return "Usuario";
    }
  };

  /**
   * Obtiene el color del rol del usuario
   */
  const getUserRoleColor = (): string => {
    if (!permissions) return "#8c8c8c";
    
    switch (permissions) {
      case "administrator":
        return "#ff4d4f";
      case "educator":
        return "#1890ff";
      case "parent":
        return "#52c41a";
      default:
        return "#8c8c8c";
    }
  };

  // ===== ESTADOS COMPUTADOS =====
  
  const isLoading = useMemo(() => {
    return userLoading || permissionsLoading || authCheckLoading;
  }, [userLoading, permissionsLoading, authCheckLoading]);

  const isReady = useMemo(() => {
    return !isLoading && user !== undefined;
  }, [isLoading, user]);

  // ===== RETORNO DEL HOOK =====
  
  return {
    // Estados
    user,
    permissions,
    isAuthenticated,
    isLoading,
    isReady,
    
    // Funciones de autenticación
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    forgotPassword: handleForgotPassword,
    updatePassword: handleUpdatePassword,
    onError,
    refetchUser,
    
    // Funciones de permisos
    hasPermission,
    hasRole,
    isAdmin,
    isEducator,
    isParent,
    
    // Funciones de utilidad
    getUserFullName,
    getUserRoleLabel,
    getUserRoleColor,
    
    // Estados de carga específicos
    userLoading,
    permissionsLoading,
    authCheckLoading,
  };
};

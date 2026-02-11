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
import { useLanguage } from "../contexts/language.context";

const AUTH_TRANSLATIONS = {
  english: {
    user: "User",
    loginSuccess: "Signed in successfully",
    welcome: "Welcome,",
    loginError: "Sign-in error",
    invalidCredentials: "Invalid credentials",
    logoutSuccess: "Signed out",
    logoutSuccessDesc: "You have signed out successfully",
    logoutError: "Sign-out error",
    logoutLocalDesc: "You have been signed out locally",
    registerSuccess: "Registration successful",
    registerSuccessDesc: "User registered successfully",
    registerError: "Registration error",
    registerErrorDesc: "User could not be registered",
    emailSent: "Email sent",
    emailSentDesc: "A recovery link has been sent to your email",
    emailError: "Email error",
    emailErrorDesc: "Recovery email could not be sent",
    passwordUpdated: "Password updated",
    passwordUpdatedDesc: "Your password has been updated successfully",
    passwordUpdateError: "Password update error",
    passwordUpdateErrorDesc: "Password could not be updated",
    roleAdministrator: "Administrator",
    roleEducator: "Educator",
    roleParent: "Parent",
  },
  spanish: {
    user: "Usuario",
    loginSuccess: "Inicio de sesión exitoso",
    welcome: "Bienvenido,",
    loginError: "Error al iniciar sesión",
    invalidCredentials: "Credenciales inválidas",
    logoutSuccess: "Sesión cerrada",
    logoutSuccessDesc: "Has cerrado sesión correctamente",
    logoutError: "Error al cerrar sesión",
    logoutLocalDesc: "Se ha cerrado la sesión localmente",
    registerSuccess: "Registro exitoso",
    registerSuccessDesc: "Usuario registrado correctamente",
    registerError: "Error en el registro",
    registerErrorDesc: "No se pudo registrar el usuario",
    emailSent: "Email enviado",
    emailSentDesc: "Se ha enviado un enlace de recuperación a tu email",
    emailError: "Error al enviar email",
    emailErrorDesc: "No se pudo enviar el email de recuperación",
    passwordUpdated: "Contraseña actualizada",
    passwordUpdatedDesc: "Tu contraseña ha sido actualizada correctamente",
    passwordUpdateError: "Error al actualizar contraseña",
    passwordUpdateErrorDesc: "No se pudo actualizar la contraseña",
    roleAdministrator: "Administrador",
    roleEducator: "Educador",
    roleParent: "Padre/Madre",
  },
} as const;

/**
 * Hook personalizado para operaciones de autenticación
 * Implementa las mejores prácticas de Refine para autenticación
 */
export const useAuth = () => {
  const { language } = useLanguage();
  const t = AUTH_TRANSLATIONS[language];

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

  // ===== LOGS DE DEBUG =====
  console.log("🔍 useAuth - user:", user);
  console.log("🔍 useAuth - permissions:", permissions);
  console.log("🔍 useAuth - isAuthenticated:", isAuthenticated);
  console.log("🔍 useAuth - userLoading:", userLoading);
  console.log("🔍 useAuth - permissionsLoading:", permissionsLoading);
  console.log("🔍 useAuth - authCheckLoading:", authCheckLoading);

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
          message: t.loginSuccess,
          description: `${t.welcome} ${user?.firstName || t.user}`,
        });
      }
    } catch (error) {
      openNotification?.({
        type: "error",
        message: t.loginError,
        description: t.invalidCredentials,
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
              message: t.logoutSuccess,
              description: t.logoutSuccessDesc,
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
              message: t.logoutError,
              description: t.logoutLocalDesc,
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
        message: t.logoutError,
        description: t.logoutLocalDesc,
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
          message: t.registerSuccess,
          description: t.registerSuccessDesc,
        });
      }
    } catch (error) {
      openNotification?.({
        type: "error",
        message: t.registerError,
        description: t.registerErrorDesc,
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
          message: t.emailSent,
          description: t.emailSentDesc,
        });
      }
    } catch (error) {
      openNotification?.({
        type: "error",
        message: t.emailError,
        description: t.emailErrorDesc,
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
          message: t.passwordUpdated,
          description: t.passwordUpdatedDesc,
        });
      }
    } catch (error) {
      openNotification?.({
        type: "error",
        message: t.passwordUpdateError,
        description: t.passwordUpdateErrorDesc,
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
    // Fallback: obtener permisos directamente del localStorage si permissions es undefined
    let currentPermissions = permissions;
    if (!currentPermissions) {
      const userFromStorage = localStorage.getItem("user");
      if (userFromStorage) {
        try {
          const userData = JSON.parse(userFromStorage);
          currentPermissions = userData.role?.name;
          console.log("🔍 isAdmin - Fallback from localStorage:", currentPermissions);
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
    }
    
    const isAdminResult = currentPermissions === "administrator";
    console.log("🔍 isAdmin - Result:", isAdminResult, "Permissions:", currentPermissions);
    return isAdminResult;
  };

  /**
   * Verifica si el usuario es educador
   */
  const isEducator = (): boolean => {
    // Fallback: obtener permisos directamente del localStorage si permissions es undefined
    let currentPermissions = permissions;
    if (!currentPermissions) {
      const userFromStorage = localStorage.getItem("user");
      if (userFromStorage) {
        try {
          const userData = JSON.parse(userFromStorage);
          currentPermissions = userData.role?.name;
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
    }
    return currentPermissions === "educator";
  };

  /**
   * Verifica si el usuario es padre/madre
   */
  const isParent = (): boolean => {
    // Fallback: obtener permisos directamente del localStorage si permissions es undefined
    let currentPermissions = permissions;
    if (!currentPermissions) {
      const userFromStorage = localStorage.getItem("user");
      if (userFromStorage) {
        try {
          const userData = JSON.parse(userFromStorage);
          currentPermissions = userData.role?.name;
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
    }
    return currentPermissions === "parent";
  };

  // ===== FUNCIONES DE UTILIDAD =====
  
  /**
   * Obtiene el nombre completo del usuario
   */
  const getUserFullName = (): string => {
    console.log("🔍 getUserFullName - User:", user);
    
    // Fallback: obtener datos directamente del localStorage si user es undefined
    let currentUser = user;
    if (!currentUser) {
      const userFromStorage = localStorage.getItem("user");
      if (userFromStorage) {
        try {
          currentUser = JSON.parse(userFromStorage);
          console.log("🔍 getUserFullName - Fallback from localStorage:", currentUser);
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
    }
    
    if (!currentUser) return t.user;
    const fullName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || t.user;
    console.log("🔍 getUserFullName - Full name:", fullName);
    return fullName;
  };

  /**
   * Obtiene el rol del usuario en formato legible
   */
  const getUserRoleLabel = (): string => {
    console.log("🔍 getUserRoleLabel - Permissions:", permissions);
    
    // Fallback: obtener permisos directamente del localStorage si permissions es undefined
    let currentPermissions = permissions;
    if (!currentPermissions) {
      const userFromStorage = localStorage.getItem("user");
      if (userFromStorage) {
        try {
          const userData = JSON.parse(userFromStorage);
          currentPermissions = userData.role?.name;
          console.log("🔍 getUserRoleLabel - Fallback from localStorage:", currentPermissions);
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
    }
    
    if (!currentPermissions) return t.user;
    
    let roleLabel: string = t.user;
    switch (currentPermissions) {
      case "administrator":
        roleLabel = t.roleAdministrator;
        break;
      case "educator":
        roleLabel = t.roleEducator;
        break;
      case "parent":
        roleLabel = t.roleParent;
        break;
      default:
        roleLabel = t.user;
    }
    console.log("🔍 getUserRoleLabel - Role label:", roleLabel);
    return roleLabel;
  };

  /**
   * Obtiene el color del rol del usuario
   */
  const getUserRoleColor = (): string => {
    // Fallback: obtener permisos directamente del localStorage si permissions es undefined
    let currentPermissions = permissions;
    if (!currentPermissions) {
      const userFromStorage = localStorage.getItem("user");
      if (userFromStorage) {
        try {
          const userData = JSON.parse(userFromStorage);
          currentPermissions = userData.role?.name;
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
    }
    
    if (!currentPermissions) return "#8c8c8c";
    
    switch (currentPermissions) {
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

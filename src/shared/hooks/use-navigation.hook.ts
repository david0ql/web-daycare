import { useMemo } from "react";
import { 
  useNavigation,
  useGo,
  useBack,
  useParsed,
  useLink,
  useGetToPath,
  useResourceParams,
  useNotification
} from "@refinedev/core";

/**
 * Hook personalizado para operaciones de navegación
 * Implementa las mejores prácticas de Refine para routing
 */
export const useAppNavigation = () => {
  const { open: openNotification } = useNotification();
  const navigation = useNavigation();
  const go = useGo();
  const back = useBack();
  const parsed = useParsed();
  const link = useLink();
  const getToPath = useGetToPath();
  const resourceParams = useResourceParams();

  // ===== FUNCIONES DE NAVEGACIÓN =====
  
  /**
   * Navega a una ruta específica
   */
  const navigateTo = (path: string, options?: any) => {
    try {
      go({ to: path, ...options });
    } catch (error) {
      openNotification?.({
        type: "error",
        message: "Error de navegación",
        description: "No se pudo navegar a la ruta solicitada",
      });
    }
  };

  /**
   * Navega a la lista de un recurso
   */
  const navigateToList = (resource: string, options?: any) => {
    navigateTo(`/${resource}`, options);
  };

  /**
   * Navega a la creación de un recurso
   */
  const navigateToCreate = (resource: string, options?: any) => {
    navigateTo(`/${resource}/create`, options);
  };

  /**
   * Navega a la edición de un recurso
   */
  const navigateToEdit = (resource: string, id: string | number, options?: any) => {
    navigateTo(`/${resource}/edit/${id}`, options);
  };

  /**
   * Navega a la vista de un recurso
   */
  const navigateToShow = (resource: string, id: string | number, options?: any) => {
    navigateTo(`/${resource}/show/${id}`, options);
  };

  /**
   * Navega al dashboard
   */
  const navigateToDashboard = (options?: any) => {
    navigateTo("/", options);
  };

  /**
   * Navega al login
   */
  const navigateToLogin = (options?: any) => {
    navigateTo("/login", options);
  };

  /**
   * Navega al registro
   */
  const navigateToRegister = (options?: any) => {
    navigateTo("/register", options);
  };

  /**
   * Navega hacia atrás
   */
  const navigateBack = () => {
    try {
      back();
    } catch (error) {
      openNotification?.({
        type: "error",
        message: "Error de navegación",
        description: "No se pudo volver atrás",
      });
    }
  };

  // ===== FUNCIONES DE ENLACES =====
  
  /**
   * Genera un enlace a una ruta
   */
  const generateLink = (to: string, options?: any) => {
    try {
      return link({ to, ...options });
    } catch (error) {
      console.error("Error generating link:", error);
      return "#";
    }
  };

  /**
   * Genera un enlace a la lista de un recurso
   */
  const generateListLink = (resource: string, options?: any) => {
    return generateLink(`/${resource}`, options);
  };

  /**
   * Genera un enlace a la creación de un recurso
   */
  const generateCreateLink = (resource: string, options?: any) => {
    return generateLink(`/${resource}/create`, options);
  };

  /**
   * Genera un enlace a la edición de un recurso
   */
  const generateEditLink = (resource: string, id: string | number, options?: any) => {
    return generateLink(`/${resource}/edit/${id}`, options);
  };

  /**
   * Genera un enlace a la vista de un recurso
   */
  const generateShowLink = (resource: string, id: string | number, options?: any) => {
    return generateLink(`/${resource}/show/${id}`, options);
  };

  /**
   * Genera un enlace al dashboard
   */
  const generateDashboardLink = (options?: any) => {
    return generateLink("/", options);
  };

  // ===== FUNCIONES DE UTILIDAD =====
  
  /**
   * Obtiene la ruta actual
   */
  const getCurrentPath = (): string => {
    return parsed?.pathname || "/";
  };

  /**
   * Obtiene los parámetros de la URL
   */
  const getCurrentParams = () => {
    return parsed?.params || {};
  };

  /**
   * Obtiene los query parameters
   */
  const getCurrentQuery = () => {
    return (parsed as any)?.query || {};
  };

  /**
   * Verifica si la ruta actual coincide con un patrón
   */
  const isCurrentRoute = (pattern: string): boolean => {
    const currentPath = getCurrentPath();
    return currentPath === pattern || currentPath.startsWith(pattern);
  };

  /**
   * Verifica si estamos en la lista de un recurso
   */
  const isInResourceList = (resource: string): boolean => {
    return isCurrentRoute(`/${resource}`);
  };

  /**
   * Verifica si estamos en la creación de un recurso
   */
  const isInResourceCreate = (resource: string): boolean => {
    return isCurrentRoute(`/${resource}/create`);
  };

  /**
   * Verifica si estamos en la edición de un recurso
   */
  const isInResourceEdit = (resource: string): boolean => {
    return isCurrentRoute(`/${resource}/edit`);
  };

  /**
   * Verifica si estamos en la vista de un recurso
   */
  const isInResourceShow = (resource: string): boolean => {
    return isCurrentRoute(`/${resource}/show`);
  };

  /**
   * Obtiene el ID del recurso actual
   */
  const getCurrentResourceId = (): string | number | undefined => {
    const params = getCurrentParams();
    return params.id;
  };

  /**
   * Obtiene el nombre del recurso actual
   */
  const getCurrentResource = (): string | undefined => {
    const path = getCurrentPath();
    const segments = path.split("/").filter(Boolean);
    return segments[0];
  };

  // ===== FUNCIONES DE NAVEGACIÓN CONDICIONAL =====
  
  /**
   * Navega solo si el usuario tiene permisos
   */
  const navigateIfAllowed = (path: string, hasPermission: boolean, options?: any) => {
    if (hasPermission) {
      navigateTo(path, options);
    } else {
      openNotification?.({
        type: "error",
        message: "Acceso denegado",
        description: "No tienes permisos para acceder a esta sección",
      });
    }
  };

  /**
   * Navega a la lista de un recurso solo si tiene permisos
   */
  const navigateToListIfAllowed = (resource: string, hasPermission: boolean, options?: any) => {
    navigateIfAllowed(`/${resource}`, hasPermission, options);
  };

  /**
   * Navega a la creación de un recurso solo si tiene permisos
   */
  const navigateToCreateIfAllowed = (resource: string, hasPermission: boolean, options?: any) => {
    navigateIfAllowed(`/${resource}/create`, hasPermission, options);
  };

  // ===== ESTADOS COMPUTADOS =====
  
  const currentPath = useMemo(() => getCurrentPath(), [parsed?.pathname]);
  const currentParams = useMemo(() => getCurrentParams(), [parsed?.params]);
  const currentQuery = useMemo(() => getCurrentQuery(), [(parsed as any)?.query]);
  const currentResource = useMemo(() => getCurrentResource(), [currentPath]);
  const currentResourceId = useMemo(() => getCurrentResourceId(), [currentParams]);

  return {
    // Funciones de navegación
    navigateTo,
    navigateToList,
    navigateToCreate,
    navigateToEdit,
    navigateToShow,
    navigateToDashboard,
    navigateToLogin,
    navigateToRegister,
    navigateBack,
    
    // Funciones de enlaces
    generateLink,
    generateListLink,
    generateCreateLink,
    generateEditLink,
    generateShowLink,
    generateDashboardLink,
    
    // Funciones de utilidad
    getCurrentPath,
    getCurrentParams,
    getCurrentQuery,
    isCurrentRoute,
    isInResourceList,
    isInResourceCreate,
    isInResourceEdit,
    isInResourceShow,
    getCurrentResourceId,
    getCurrentResource,
    
    // Funciones de navegación condicional
    navigateIfAllowed,
    navigateToListIfAllowed,
    navigateToCreateIfAllowed,
    
    // Estados actuales
    currentPath,
    currentParams,
    currentQuery,
    currentResource,
    currentResourceId,
    
    // Hooks originales de Refine
    navigation,
    go,
    back,
    parsed,
    link,
    getToPath,
    resourceParams,
  };
};

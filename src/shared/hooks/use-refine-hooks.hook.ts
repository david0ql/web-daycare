import { 
  useList, 
  useOne, 
  useMany, 
  useCreate, 
  useCreateMany, 
  useUpdate, 
  useUpdateMany, 
  useDelete, 
  useDeleteMany, 
  useCustom, 
  useCustomMutation,
  useDataProvider,
  useApiUrl,
  useShow,
  useTable,
  useForm,
  useSelect,
  useInvalidate,
  useInfiniteList,
  useGetIdentity,
  useLogin,
  useLogout,
  usePermissions,
  useIsAuthenticated,
  useOnError,
  useRegister,
  useForgotPassword,
  useUpdatePassword,
  useNotification,
  useNavigation,
  useGo,
  useBack,
  useParsed,
  useLink,
  useGetToPath,
  useResourceParams,
  useCan
} from "@refinedev/core";
import { useMemo } from "react";

/**
 * Hook personalizado que centraliza todos los hooks de Refine
 * Implementa las mejores prácticas y proporciona una interfaz consistente
 */
export const useRefineHooks = () => {
  // ===== DATA HOOKS =====
  
  /**
   * Hook para obtener listas de datos
   */
  const useDataList = (resource: string, options?: any) => {
    return useList({
      resource,
      ...options,
    });
  };

  /**
   * Hook para obtener un elemento específico
   */
  const useDataOne = (resource: string, id: string | number, options?: any) => {
    return useOne({
      resource,
      id,
      ...options,
    });
  };

  /**
   * Hook para obtener múltiples elementos
   */
  const useDataMany = (resource: string, ids: (string | number)[], options?: any) => {
    return useMany({
      resource,
      ids,
      ...options,
    });
  };

  /**
   * Hook para crear un elemento
   */
  const useDataCreate = (resource: string, options?: any) => {
    return useCreate({
      resource,
      ...options,
    });
  };

  /**
   * Hook para crear múltiples elementos
   */
  const useDataCreateMany = (resource: string, options?: any) => {
    return useCreateMany({
      resource,
      ...options,
    });
  };

  /**
   * Hook para actualizar un elemento
   */
  const useDataUpdate = (resource: string, options?: any) => {
    return useUpdate({
      resource,
      ...options,
    });
  };

  /**
   * Hook para actualizar múltiples elementos
   */
  const useDataUpdateMany = (resource: string, options?: any) => {
    return useUpdateMany({
      resource,
      ...options,
    });
  };

  /**
   * Hook para eliminar un elemento
   */
  const useDataDelete = (resource: string, options?: any) => {
    return useDelete({
      resource,
      ...options,
    });
  };

  /**
   * Hook para eliminar múltiples elementos
   */
  const useDataDeleteMany = (resource: string, options?: any) => {
    return useDeleteMany({
      resource,
      ...options,
    });
  };

  /**
   * Hook para operaciones personalizadas (GET)
   */
  const useDataCustom = (url: string, options?: any) => {
    return useCustom({
      url,
      method: "get",
      ...options,
    });
  };

  /**
   * Hook para operaciones personalizadas (POST, PUT, PATCH, DELETE)
   */
  const useDataCustomMutation = (url: string, method: "post" | "put" | "patch" | "delete" = "post", options?: any) => {
    return useCustomMutation({
      url,
      method,
      ...options,
    });
  };

  // ===== AUTHENTICATION HOOKS =====
  
  /**
   * Hook para obtener la identidad del usuario
   */
  const useUserIdentity = () => {
    return useGetIdentity();
  };

  /**
   * Hook para login
   */
  const useUserLogin = () => {
    return useLogin();
  };

  /**
   * Hook para logout
   */
  const useUserLogout = () => {
    return useLogout();
  };

  /**
   * Hook para verificar si el usuario está autenticado
   */
  const useUserAuthenticated = () => {
    return useIsAuthenticated();
  };

  /**
   * Hook para obtener permisos del usuario
   */
  const useUserPermissions = (params?: any) => {
    return usePermissions({ params });
  };

  /**
   * Hook para manejo de errores de autenticación
   */
  const useUserOnError = () => {
    return useOnError();
  };

  /**
   * Hook para registro de usuarios
   */
  const useUserRegister = () => {
    return useRegister();
  };

  /**
   * Hook para recuperar contraseña
   */
  const useUserForgotPassword = () => {
    return useForgotPassword();
  };

  /**
   * Hook para actualizar contraseña
   */
  const useUserUpdatePassword = () => {
    return useUpdatePassword();
  };

  // ===== ROUTING HOOKS =====
  
  /**
   * Hook para navegación
   */
  const useAppNavigation = () => {
    return useNavigation();
  };

  /**
   * Hook para navegar a una ruta específica
   */
  const useAppGo = () => {
    return useGo();
  };

  /**
   * Hook para volver atrás
   */
  const useAppBack = () => {
    return useBack();
  };

  /**
   * Hook para obtener parámetros parseados de la URL
   */
  const useAppParsed = () => {
    return useParsed();
  };

  /**
   * Hook para generar enlaces
   */
  const useAppLink = () => {
    return useLink();
  };

  /**
   * Hook para obtener la ruta de destino
   */
  const useAppGetToPath = () => {
    return useGetToPath();
  };

  /**
   * Hook para obtener parámetros del recurso
   */
  const useAppResourceParams = () => {
    return useResourceParams();
  };

  // ===== NOTIFICATION HOOKS =====
  
  /**
   * Hook para notificaciones
   */
  const useAppNotification = () => {
    return useNotification();
  };

  // ===== AUTHORIZATION HOOKS =====
  
  /**
   * Hook para verificar permisos específicos
   */
  const useAppCan = (action: string, resource: string, params?: any) => {
    return useCan({
      action,
      resource,
      params,
    });
  };

  // ===== UTILITY HOOKS =====
  
  /**
   * Hook para obtener el data provider
   */
  const useAppDataProvider = () => {
    return useDataProvider();
  };

  /**
   * Hook para obtener la URL de la API
   */
  const useAppApiUrl = () => {
    return useApiUrl();
  };

  /**
   * Hook para invalidar queries
   */
  const useAppInvalidate = () => {
    return useInvalidate();
  };

  // ===== FORM HOOKS =====
  
  /**
   * Hook para formularios
   */
  const useAppForm = (resource: string, options?: any) => {
    return useForm({
      resource,
      ...options,
    });
  };

  /**
   * Hook para tablas
   */
  const useAppTable = (resource: string, options?: any) => {
    return useTable({
      resource,
      ...options,
    });
  };

  /**
   * Hook para mostrar detalles
   */
  const useAppShow = (resource: string, id: string | number, options?: any) => {
    return useShow({
      resource,
      id,
      ...options,
    });
  };

  /**
   * Hook para selects
   */
  const useAppSelect = (resource: string, options?: any) => {
    return useSelect({
      resource,
      ...options,
    });
  };

  /**
   * Hook para listas infinitas
   */
  const useAppInfiniteList = (resource: string, options?: any) => {
    return useInfiniteList({
      resource,
      ...options,
    });
  };

  // ===== COMBINED HOOKS =====
  
  /**
   * Hook combinado para operaciones CRUD completas
   */
  const useCrudOperations = (resource: string) => {
    const list = useDataList(resource);
    const create = useDataCreate(resource);
    const update = useDataUpdate(resource);
    const deleteOne = useDataDelete(resource);
    const invalidate = useAppInvalidate();

    const refresh = () => {
      invalidate({
        resource,
        invalidates: ["list", "many", "detail"],
      });
    };

    return {
      list,
      create,
      update,
      delete: deleteOne,
      refresh,
    };
  };

  /**
   * Hook combinado para autenticación completa
   */
  const useAuthOperations = () => {
    const identity = useUserIdentity();
    const login = useUserLogin();
    const logout = useUserLogout();
    const isAuthenticated = useUserAuthenticated();
    const permissions = useUserPermissions();
    const onError = useUserOnError();

    return {
      identity,
      login,
      logout,
      isAuthenticated,
      permissions,
      onError,
    };
  };

  /**
   * Hook combinado para navegación completa
   */
  const useNavigationOperations = () => {
    const navigation = useAppNavigation();
    const go = useAppGo();
    const back = useAppBack();
    const parsed = useAppParsed();
    const link = useAppLink();
    const getToPath = useAppGetToPath();
    const resourceParams = useAppResourceParams();

    return {
      navigation,
      go,
      back,
      parsed,
      link,
      getToPath,
      resourceParams,
    };
  };

  return {
    // Data hooks
    useDataList,
    useDataOne,
    useDataMany,
    useDataCreate,
    useDataCreateMany,
    useDataUpdate,
    useDataUpdateMany,
    useDataDelete,
    useDataDeleteMany,
    useDataCustom,
    useDataCustomMutation,
    
    // Authentication hooks
    useUserIdentity,
    useUserLogin,
    useUserLogout,
    useUserAuthenticated,
    useUserPermissions,
    useUserOnError,
    useUserRegister,
    useUserForgotPassword,
    useUserUpdatePassword,
    
    // Routing hooks
    useAppNavigation,
    useAppGo,
    useAppBack,
    useAppParsed,
    useAppLink,
    useAppGetToPath,
    useAppResourceParams,
    
    // Notification hooks
    useAppNotification,
    
    // Authorization hooks
    useAppCan,
    
    // Utility hooks
    useAppDataProvider,
    useAppApiUrl,
    useAppInvalidate,
    
    // Form hooks
    useAppForm,
    useAppTable,
    useAppShow,
    useAppSelect,
    useAppInfiniteList,
    
    // Combined hooks
    useCrudOperations,
    useAuthOperations,
    useNavigationOperations,
  };
};

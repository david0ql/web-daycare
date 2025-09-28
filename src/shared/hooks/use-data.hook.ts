import { useMemo } from "react";
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
  useInvalidate,
  useNotification
} from "@refinedev/core";

/**
 * Hook personalizado para operaciones de datos
 * Implementa las mejores prácticas de Refine para manejo de datos
 */
export const useData = () => {
  const { open: openNotification } = useNotification();
  const invalidate = useInvalidate();

  // ===== FUNCIONES DE NOTIFICACIÓN =====
  
  const showSuccessNotification = (message: string, description?: string) => {
    openNotification?.({
      type: "success",
      message,
      description,
    });
  };

  const showErrorNotification = (message: string, description?: string) => {
    openNotification?.({
      type: "error",
      message,
      description,
    });
  };

  // ===== HOOKS PARA LISTAS =====
  
  /**
   * Hook para obtener listas con manejo de errores
   */
  const useDataList = (resource: string, options?: any) => {
    const result = useList({
      resource,
      ...options,
    });

    // Manejo de errores
    if (result.query.isError) {
      showErrorNotification(
        "Error al cargar datos",
        `No se pudieron cargar los datos de ${resource}`
      );
    }

    return result;
  };

  /**
   * Hook para obtener un elemento específico
   */
  const useDataOne = (resource: string, id: string | number, options?: any) => {
    const result = useOne({
      resource,
      id,
      ...options,
    });

    if (result.query.isError) {
      showErrorNotification(
        "Error al cargar elemento",
        `No se pudo cargar el elemento de ${resource}`
      );
    }

    return result;
  };

  /**
   * Hook para obtener múltiples elementos
   */
  const useDataMany = (resource: string, ids: (string | number)[], options?: any) => {
    const result = useMany({
      resource,
      ids,
      ...options,
    });

    if (result.query.isError) {
      showErrorNotification(
        "Error al cargar elementos",
        `No se pudieron cargar los elementos de ${resource}`
      );
    }

    return result;
  };

  // ===== HOOKS PARA CREACIÓN =====
  
  /**
   * Hook para crear un elemento
   */
  const useDataCreate = (resource: string, options?: any) => {
    const result = useCreate({
      resource,
      ...options,
    });

    const createWithNotification = async (values: any) => {
      try {
        const response = await result.mutateAsync(values);
        showSuccessNotification(
          "Elemento creado",
          `Se ha creado el elemento en ${resource} correctamente`
        );
        
        // Invalidar listas relacionadas
        invalidate({
          resource,
          invalidates: ["list", "many"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          "Error al crear elemento",
          `No se pudo crear el elemento en ${resource}`
        );
        throw error;
      }
    };

    return {
      ...result,
      create: createWithNotification,
    };
  };

  /**
   * Hook para crear múltiples elementos
   */
  const useDataCreateMany = (resource: string, options?: any) => {
    const result = useCreateMany({
      resource,
      ...options,
    });

    const createManyWithNotification = async (values: any[]) => {
      try {
        const response = await result.mutateAsync({ values });
        showSuccessNotification(
          "Elementos creados",
          `Se han creado ${values.length} elementos en ${resource} correctamente`
        );
        
        invalidate({
          resource,
          invalidates: ["list", "many"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          "Error al crear elementos",
          `No se pudieron crear los elementos en ${resource}`
        );
        throw error;
      }
    };

    return {
      ...result,
      createMany: createManyWithNotification,
    };
  };

  // ===== HOOKS PARA ACTUALIZACIÓN =====
  
  /**
   * Hook para actualizar un elemento
   */
  const useDataUpdate = (resource: string, options?: any) => {
    const result = useUpdate({
      resource,
      ...options,
    });

    const updateWithNotification = async (values: any) => {
      try {
        const response = await result.mutateAsync(values);
        showSuccessNotification(
          "Elemento actualizado",
          `Se ha actualizado el elemento en ${resource} correctamente`
        );
        
        invalidate({
          resource,
          invalidates: ["list", "many", "detail"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          "Error al actualizar elemento",
          `No se pudo actualizar el elemento en ${resource}`
        );
        throw error;
      }
    };

    return {
      ...result,
      update: updateWithNotification,
    };
  };

  /**
   * Hook para actualizar múltiples elementos
   */
  const useDataUpdateMany = (resource: string, options?: any) => {
    const result = useUpdateMany({
      resource,
      ...options,
    });

    const updateManyWithNotification = async (values: any) => {
      try {
        const response = await result.mutateAsync(values);
        showSuccessNotification(
          "Elementos actualizados",
          `Se han actualizado los elementos en ${resource} correctamente`
        );
        
        invalidate({
          resource,
          invalidates: ["list", "many"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          "Error al actualizar elementos",
          `No se pudieron actualizar los elementos en ${resource}`
        );
        throw error;
      }
    };

    return {
      ...result,
      updateMany: updateManyWithNotification,
    };
  };

  // ===== HOOKS PARA ELIMINACIÓN =====
  
  /**
   * Hook para eliminar un elemento
   */
  const useDataDelete = (resource: string, options?: any) => {
    const result = useDelete({
      resource,
      ...options,
    });

    const deleteWithNotification = async (id: string | number) => {
      try {
        const response = await result.mutateAsync({ id, resource });
        showSuccessNotification(
          "Elemento eliminado",
          `Se ha eliminado el elemento de ${resource} correctamente`
        );
        
        invalidate({
          resource,
          invalidates: ["list", "many"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          "Error al eliminar elemento",
          `No se pudo eliminar el elemento de ${resource}`
        );
        throw error;
      }
    };

    return {
      ...result,
      delete: deleteWithNotification,
    };
  };

  /**
   * Hook para eliminar múltiples elementos
   */
  const useDataDeleteMany = (resource: string, options?: any) => {
    const result = useDeleteMany({
      resource,
      ...options,
    });

    const deleteManyWithNotification = async (ids: (string | number)[]) => {
      try {
        const response = await result.mutateAsync({ ids, resource });
        showSuccessNotification(
          "Elementos eliminados",
          `Se han eliminado ${ids.length} elementos de ${resource} correctamente`
        );
        
        invalidate({
          resource,
          invalidates: ["list", "many"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          "Error al eliminar elementos",
          `No se pudieron eliminar los elementos de ${resource}`
        );
        throw error;
      }
    };

    return {
      ...result,
      deleteMany: deleteManyWithNotification,
    };
  };

  // ===== HOOKS PARA OPERACIONES PERSONALIZADAS =====
  
  /**
   * Hook para operaciones GET personalizadas
   */
  const useDataCustom = (url: string, options?: any) => {
    const result = useCustom({
      url,
      method: "get",
      ...options,
    });

    if (result.query.isError) {
      showErrorNotification(
        "Error en operación personalizada",
        `No se pudo realizar la operación GET en ${url}`
      );
    }

    return result;
  };

  /**
   * Hook para operaciones POST/PUT/PATCH/DELETE personalizadas
   */
  const useDataCustomMutation = (url: string, method: "post" | "put" | "patch" | "delete" = "post", options?: any) => {
    const result = useCustomMutation({
      url,
      method,
      ...options,
    });

    const mutateWithNotification = async (values?: any) => {
      try {
        const response = await result.mutateAsync(values);
        showSuccessNotification(
          "Operación exitosa",
          `La operación ${method.toUpperCase()} en ${url} se completó correctamente`
        );
        return response;
      } catch (error) {
        showErrorNotification(
          "Error en operación",
          `No se pudo realizar la operación ${method.toUpperCase()} en ${url}`
        );
        throw error;
      }
    };

    return {
      ...result,
      mutate: mutateWithNotification,
    };
  };

  // ===== FUNCIONES DE UTILIDAD =====
  
  /**
   * Función para refrescar datos de un recurso
   */
  const refreshResource = (resource: string) => {
    invalidate({
      resource,
      invalidates: ["list", "many", "detail"],
    });
  };

  /**
   * Función para refrescar todos los datos
   */
  const refreshAll = () => {
    invalidate({
      invalidates: ["list", "many", "detail"],
    });
  };

  return {
    // Hooks de lectura
    useDataList,
    useDataOne,
    useDataMany,
    
    // Hooks de creación
    useDataCreate,
    useDataCreateMany,
    
    // Hooks de actualización
    useDataUpdate,
    useDataUpdateMany,
    
    // Hooks de eliminación
    useDataDelete,
    useDataDeleteMany,
    
    // Hooks personalizados
    useDataCustom,
    useDataCustomMutation,
    
    // Funciones de utilidad
    refreshResource,
    refreshAll,
    invalidate,
  };
};

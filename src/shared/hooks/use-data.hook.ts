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
import { useLanguage } from "../contexts/language.context";

const DATA_TRANSLATIONS = {
  english: {
    loadDataError: "Error loading data",
    loadDataErrorDescription: (resource: string) => `Could not load data from ${resource}`,
    loadItemError: "Error loading item",
    loadItemErrorDescription: (resource: string) => `Could not load the item from ${resource}`,
    loadItemsError: "Error loading items",
    loadItemsErrorDescription: (resource: string) => `Could not load items from ${resource}`,
    itemCreated: "Item created",
    itemCreatedDescription: (resource: string) => `The item was created in ${resource} successfully`,
    createItemError: "Error creating item",
    createItemErrorDescription: (resource: string) => `Could not create the item in ${resource}`,
    itemsCreated: "Items created",
    itemsCreatedDescription: (count: number, resource: string) =>
      `${count} item(s) were created in ${resource} successfully`,
    createItemsError: "Error creating items",
    createItemsErrorDescription: (resource: string) => `Could not create items in ${resource}`,
    itemUpdated: "Item updated",
    itemUpdatedDescription: (resource: string) => `The item was updated in ${resource} successfully`,
    updateItemError: "Error updating item",
    updateItemErrorDescription: (resource: string) => `Could not update the item in ${resource}`,
    itemsUpdated: "Items updated",
    itemsUpdatedDescription: (resource: string) => `Items were updated in ${resource} successfully`,
    updateItemsError: "Error updating items",
    updateItemsErrorDescription: (resource: string) => `Could not update items in ${resource}`,
    itemDeleted: "Item deleted",
    itemDeletedDescription: (resource: string) => `The item was deleted from ${resource} successfully`,
    deleteItemError: "Error deleting item",
    deleteItemErrorDescription: (resource: string) => `Could not delete the item from ${resource}`,
    itemsDeleted: "Items deleted",
    itemsDeletedDescription: (count: number, resource: string) =>
      `${count} item(s) were deleted from ${resource} successfully`,
    deleteItemsError: "Error deleting items",
    deleteItemsErrorDescription: (resource: string) => `Could not delete items from ${resource}`,
    customOperationError: "Error in custom operation",
    customOperationErrorDescription: (url: string) => `Could not perform GET operation on ${url}`,
    operationSuccess: "Operation successful",
    operationSuccessDescription: (method: string, url: string) =>
      `The ${method.toUpperCase()} operation on ${url} completed successfully`,
    operationError: "Error in operation",
    operationErrorDescription: (method: string, url: string) =>
      `Could not perform the ${method.toUpperCase()} operation on ${url}`,
  },
  spanish: {
    loadDataError: "Error al cargar datos",
    loadDataErrorDescription: (resource: string) => `No se pudieron cargar los datos de ${resource}`,
    loadItemError: "Error al cargar elemento",
    loadItemErrorDescription: (resource: string) => `No se pudo cargar el elemento de ${resource}`,
    loadItemsError: "Error al cargar elementos",
    loadItemsErrorDescription: (resource: string) => `No se pudieron cargar los elementos de ${resource}`,
    itemCreated: "Elemento creado",
    itemCreatedDescription: (resource: string) => `Se ha creado el elemento en ${resource} correctamente`,
    createItemError: "Error al crear elemento",
    createItemErrorDescription: (resource: string) => `No se pudo crear el elemento en ${resource}`,
    itemsCreated: "Elementos creados",
    itemsCreatedDescription: (count: number, resource: string) =>
      `Se han creado ${count} elementos en ${resource} correctamente`,
    createItemsError: "Error al crear elementos",
    createItemsErrorDescription: (resource: string) => `No se pudieron crear los elementos en ${resource}`,
    itemUpdated: "Elemento actualizado",
    itemUpdatedDescription: (resource: string) => `Se ha actualizado el elemento en ${resource} correctamente`,
    updateItemError: "Error al actualizar elemento",
    updateItemErrorDescription: (resource: string) => `No se pudo actualizar el elemento en ${resource}`,
    itemsUpdated: "Elementos actualizados",
    itemsUpdatedDescription: (resource: string) => `Se han actualizado los elementos en ${resource} correctamente`,
    updateItemsError: "Error al actualizar elementos",
    updateItemsErrorDescription: (resource: string) => `No se pudieron actualizar los elementos en ${resource}`,
    itemDeleted: "Elemento eliminado",
    itemDeletedDescription: (resource: string) => `Se ha eliminado el elemento de ${resource} correctamente`,
    deleteItemError: "Error al eliminar elemento",
    deleteItemErrorDescription: (resource: string) => `No se pudo eliminar el elemento de ${resource}`,
    itemsDeleted: "Elementos eliminados",
    itemsDeletedDescription: (count: number, resource: string) =>
      `Se han eliminado ${count} elementos de ${resource} correctamente`,
    deleteItemsError: "Error al eliminar elementos",
    deleteItemsErrorDescription: (resource: string) => `No se pudieron eliminar los elementos de ${resource}`,
    customOperationError: "Error en operación personalizada",
    customOperationErrorDescription: (url: string) => `No se pudo realizar la operación GET en ${url}`,
    operationSuccess: "Operación exitosa",
    operationSuccessDescription: (method: string, url: string) =>
      `La operación ${method.toUpperCase()} en ${url} se completó correctamente`,
    operationError: "Error en operación",
    operationErrorDescription: (method: string, url: string) =>
      `No se pudo realizar la operación ${method.toUpperCase()} en ${url}`,
  },
} as const;

/**
 * Hook personalizado para operaciones de datos
 * Implementa las mejores prácticas de Refine para manejo de datos
 */
export const useData = () => {
  const { open: openNotification } = useNotification();
  const invalidate = useInvalidate();
  const { language } = useLanguage();
  const t = DATA_TRANSLATIONS[language];

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
        t.loadDataError,
        t.loadDataErrorDescription(resource),
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
        t.loadItemError,
        t.loadItemErrorDescription(resource),
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
        t.loadItemsError,
        t.loadItemsErrorDescription(resource),
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
          t.itemCreated,
          t.itemCreatedDescription(resource),
        );
        
        // Invalidar listas relacionadas
        invalidate({
          resource,
          invalidates: ["list", "many"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          t.createItemError,
          t.createItemErrorDescription(resource),
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
          t.itemsCreated,
          t.itemsCreatedDescription(values.length, resource),
        );
        
        invalidate({
          resource,
          invalidates: ["list", "many"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          t.createItemsError,
          t.createItemsErrorDescription(resource),
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
          t.itemUpdated,
          t.itemUpdatedDescription(resource),
        );
        
        invalidate({
          resource,
          invalidates: ["list", "many", "detail"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          t.updateItemError,
          t.updateItemErrorDescription(resource),
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
          t.itemsUpdated,
          t.itemsUpdatedDescription(resource),
        );
        
        invalidate({
          resource,
          invalidates: ["list", "many"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          t.updateItemsError,
          t.updateItemsErrorDescription(resource),
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
          t.itemDeleted,
          t.itemDeletedDescription(resource),
        );
        
        invalidate({
          resource,
          invalidates: ["list", "many"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          t.deleteItemError,
          t.deleteItemErrorDescription(resource),
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
          t.itemsDeleted,
          t.itemsDeletedDescription(ids.length, resource),
        );
        
        invalidate({
          resource,
          invalidates: ["list", "many"],
        });
        
        return response;
      } catch (error) {
        showErrorNotification(
          t.deleteItemsError,
          t.deleteItemsErrorDescription(resource),
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
        t.customOperationError,
        t.customOperationErrorDescription(url),
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
          t.operationSuccess,
          t.operationSuccessDescription(method, url),
        );
        return response;
      } catch (error) {
        showErrorNotification(
          t.operationError,
          t.operationErrorDescription(method, url),
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

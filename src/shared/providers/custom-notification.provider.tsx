import React, { useCallback } from "react";
import { useNotificationProvider as useRefineNotificationProvider } from "@refinedev/antd";
import { NotificationProvider } from "@refinedev/core";
import { notification } from "antd";

/**
 * Notification Provider personalizado que evita notificaciones duplicadas
 * Solo muestra notificaciones que no hayan sido manejadas por el interceptor
 */
export const useCustomNotificationProvider = (): NotificationProvider => {
  const refineProvider = useRefineNotificationProvider();

  const open = useCallback((config?: any) => {
    // Si la notificación viene de un error que ya fue manejado por el interceptor, ignorarla
    // Los errores manejados por el interceptor tienen la propiedad __notificationHandled
    if (config?.key && typeof config.key === "string") {
      // Verificar si es una notificación de error automática de Refine
      // Si el error ya fue manejado, no mostrar la notificación
      const error = (window as any).__lastAxiosError;
      if (error && (error.__notificationHandled || error.skipNotification)) {
        // Limpiar el error después de verificar
        delete (window as any).__lastAxiosError;
        return;
      }
    }

    // Mostrar notificación normalmente
    refineProvider.open?.(config);
  }, [refineProvider]);

  return {
    ...refineProvider,
    open,
    close: refineProvider.close,
  };
};



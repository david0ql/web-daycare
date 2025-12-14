import { useEffect } from "react";
import { useNotification } from "@refinedev/core";
import { notificationService, NotificationConfig } from "../services/notification.service";

/**
 * Componente que inicializa el servicio global de notificaciones
 * Registra el callback de notificaciones de Refine para que pueda
 * ser usado desde interceptores de axios
 */
export const NotificationInitializer: React.FC = () => {
  const { open } = useNotification();

  useEffect(() => {
    // Registrar el callback de notificaciones
    if (open) {
      notificationService.register((config: NotificationConfig) => {
        // Convertir tipos de notificación para compatibilidad con Refine
        // Refine solo acepta: "success" | "error" | "progress"
        // Nuestro servicio usa: "success" | "error" | "info" | "warning"
        let refinedType: "success" | "error" | "progress";
        
        if (config.type === "error") {
          refinedType = "error";
        } else if (config.type === "info" || config.type === "warning") {
          // Convertir info y warning a success para compatibilidad
          refinedType = "success";
        } else {
          refinedType = "success";
        }

        open({
          type: refinedType,
          message: config.message,
          description: config.description,
          key: config.message, // Usar el mensaje como key único
        });
      });
    }

    // Limpiar al desmontar
    return () => {
      notificationService.unregister();
    };
  }, [open]);

  return null;
};



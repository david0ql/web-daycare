import { useEffect } from "react";
import { useNotification } from "@refinedev/core";
import { notificationService } from "../services/notification.service";

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
      notificationService.register((config) => {
        open(config);
      });
    }

    // Limpiar al desmontar
    return () => {
      notificationService.unregister();
    };
  }, [open]);

  return null;
};



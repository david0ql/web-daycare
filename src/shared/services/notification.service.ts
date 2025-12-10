/**
 * Servicio global de notificaciones
 * Permite mostrar notificaciones desde cualquier parte de la aplicación,
 * incluyendo interceptores de axios que no tienen acceso directo a hooks de React
 */

export interface NotificationConfig {
  type: "success" | "error" | "info" | "warning";
  message: string;
  description?: string;
  duration?: number;
}

type NotificationCallback = (config: NotificationConfig) => void;

class NotificationService {
  private notificationCallback: NotificationCallback | null = null;

  /**
   * Registra el callback de notificaciones desde el contexto de Refine
   */
  register(callback: NotificationCallback): void {
    this.notificationCallback = callback;
  }

  /**
   * Desregistra el callback de notificaciones
   */
  unregister(): void {
    this.notificationCallback = null;
  }

  /**
   * Muestra una notificación
   */
  notify(config: NotificationConfig): void {
    if (this.notificationCallback) {
      this.notificationCallback(config);
    } else {
      // Fallback: mostrar en consola si no hay callback registrado
      console.warn("Notification service not initialized:", config);
    }
  }

  /**
   * Muestra una notificación de error
   */
  error(message: string, description?: string): void {
    this.notify({
      type: "error",
      message,
      description,
    });
  }

  /**
   * Muestra una notificación de éxito
   */
  success(message: string, description?: string): void {
    this.notify({
      type: "success",
      message,
      description,
    });
  }

  /**
   * Muestra una notificación de información
   */
  info(message: string, description?: string): void {
    this.notify({
      type: "info",
      message,
      description,
    });
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(message: string, description?: string): void {
    this.notify({
      type: "warning",
      message,
      description,
    });
  }
}

// Exportar instancia singleton
export const notificationService = new NotificationService();



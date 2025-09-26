// Paleta de colores profesional para The Children's World
export const colors = {
  // Colores principales
  primary: {
    main: '#1f2937',      // Gris oscuro elegante
    light: '#374151',     // Gris medio
    dark: '#111827',      // Gris muy oscuro
    contrast: '#ffffff',  // Blanco para contraste
  },
  
  // Colores secundarios
  secondary: {
    main: '#3b82f6',      // Azul profesional
    light: '#60a5fa',     // Azul claro
    dark: '#1d4ed8',      // Azul oscuro
    contrast: '#ffffff',
  },
  
  // Colores de acento
  accent: {
    main: '#6366f1',      // Índigo elegante
    light: '#818cf8',     // Índigo claro
    dark: '#4338ca',      // Índigo oscuro
    contrast: '#ffffff',
  },
  
  // Colores de estado
  success: {
    main: '#10b981',      // Verde esmeralda
    light: '#34d399',     // Verde claro
    dark: '#059669',      // Verde oscuro
    contrast: '#ffffff',
  },
  
  warning: {
    main: '#f59e0b',      // Ámbar profesional
    light: '#fbbf24',     // Ámbar claro
    dark: '#d97706',      // Ámbar oscuro
    contrast: '#ffffff',
  },
  
  error: {
    main: '#ef4444',      // Rojo profesional
    light: '#f87171',     // Rojo claro
    dark: '#dc2626',      // Rojo oscuro
    contrast: '#ffffff',
  },
  
  // Colores neutros
  neutral: {
    50: '#f9fafb',        // Gris muy claro
    100: '#f3f4f6',       // Gris claro
    200: '#e5e7eb',       // Gris medio claro
    300: '#d1d5db',       // Gris medio
    400: '#9ca3af',       // Gris medio oscuro
    500: '#6b7280',       // Gris
    600: '#4b5563',       // Gris oscuro
    700: '#374151',       // Gris muy oscuro
    800: '#1f2937',       // Gris extremadamente oscuro
    900: '#111827',       // Negro grisáceo
  },
  
  // Colores de fondo
  background: {
    primary: '#ffffff',   // Blanco puro
    secondary: '#f9fafb', // Gris muy claro
    tertiary: '#f3f4f6',  // Gris claro
    dark: '#1f2937',      // Gris oscuro
  },
  
  // Colores de texto
  text: {
    primary: '#111827',   // Negro grisáceo
    secondary: '#4b5563', // Gris oscuro
    tertiary: '#6b7280',  // Gris
    disabled: '#9ca3af',  // Gris medio oscuro
    inverse: '#ffffff',   // Blanco
  },
  
  // Colores de borde
  border: {
    light: '#e5e7eb',     // Gris medio claro
    medium: '#d1d5db',    // Gris medio
    dark: '#9ca3af',      // Gris medio oscuro
  },
  
  // Gradientes profesionales
  gradients: {
    primary: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    secondary: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    accent: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
    subtle: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
  },
  
  // Sombras profesionales
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  }
};

// Configuración de tema
export const theme = {
  colors,
  
  // Espaciado
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // Bordes redondeados
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },
  
  // Tipografía
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

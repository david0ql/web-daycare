# Paleta de Colores Profesional - The Children's World

## 🎨 Paleta Principal

### Colores Primarios
- **Principal**: `#1f2937` - Gris oscuro elegante (botones principales)
- **Claro**: `#374151` - Gris medio
- **Oscuro**: `#111827` - Gris muy oscuro
- **Contraste**: `#ffffff` - Blanco puro

### Colores Secundarios
- **Principal**: `#3b82f6` - Azul profesional (enlaces, acentos)
- **Claro**: `#60a5fa` - Azul claro
- **Oscuro**: `#1d4ed8` - Azul oscuro

### Colores de Acento
- **Principal**: `#6366f1` - Índigo elegante
- **Claro**: `#818cf8` - Índigo claro
- **Oscuro**: `#4338ca` - Índigo oscuro

## 🎯 Colores de Estado

### Éxito
- **Principal**: `#10b981` - Verde esmeralda
- **Claro**: `#34d399` - Verde claro
- **Oscuro**: `#059669` - Verde oscuro

### Advertencia
- **Principal**: `#f59e0b` - Ámbar profesional
- **Claro**: `#fbbf24` - Ámbar claro
- **Oscuro**: `#d97706` - Ámbar oscuro

### Error
- **Principal**: `#ef4444` - Rojo profesional
- **Claro**: `#f87171` - Rojo claro
- **Oscuro**: `#dc2626` - Rojo oscuro

## 📝 Colores de Texto

- **Primario**: `#111827` - Negro grisáceo (títulos principales)
- **Secundario**: `#4b5563` - Gris oscuro (subtítulos)
- **Terciario**: `#6b7280` - Gris (texto normal)
- **Deshabilitado**: `#9ca3af` - Gris medio oscuro (texto de ayuda)

## 🎨 Gradientes Profesionales

- **Fondo**: `linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)`
- **Primario**: `linear-gradient(135deg, #1f2937 0%, #374151 100%)`
- **Secundario**: `linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)`

## 📐 Sombras Profesionales

- **Pequeña**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **Mediana**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **Grande**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`

## 🚀 Uso

```typescript
import { colors } from '../styles/colors';

// Botón principal
style={{ 
  background: colors.primary.main,
  borderColor: colors.primary.main 
}}

// Enlace secundario
style={{ color: colors.secondary.main }}

// Texto secundario
style={{ color: colors.text.secondary }}

// Fondo con gradiente
style={{ background: colors.gradients.background }}
```

## ✨ Características

- **Profesional**: Colores sobrios y elegantes
- **Accesible**: Contraste adecuado para legibilidad
- **Consistente**: Paleta unificada en toda la aplicación
- **Escalable**: Fácil de mantener y extender

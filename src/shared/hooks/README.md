# Hooks de Refine - Implementación Completa

Este directorio contiene una implementación completa de todos los hooks de Refine con las mejores prácticas, siguiendo la documentación oficial.

## 📚 Hooks Implementados

### 🔐 Autenticación (`use-auth.hook.ts`)

Hook personalizado que centraliza todas las operaciones de autenticación:

```typescript
import { useAuth } from '../hooks/use-auth.hook';

const { 
  user, 
  permissions, 
  isAdmin, 
  isEducator, 
  isParent,
  getUserFullName,
  getUserRoleLabel,
  getUserRoleColor,
  login,
  logout,
  register,
  forgotPassword,
  updatePassword
} = useAuth();
```

**Funciones disponibles:**
- `login(credentials)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `register(userData)` - Registrar usuario
- `forgotPassword(email)` - Recuperar contraseña
- `updatePassword(passwordData)` - Actualizar contraseña
- `hasPermission(permission)` - Verificar permiso específico
- `hasRole(role)` - Verificar rol específico
- `isAdmin()` - Verificar si es administrador
- `isEducator()` - Verificar si es educador
- `isParent()` - Verificar si es padre/madre

### 📊 Datos (`use-data.hook.ts`)

Hook personalizado para operaciones CRUD con manejo de errores y notificaciones:

```typescript
import { useData } from '../hooks/use-data.hook';

const { 
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
  refreshResource,
  refreshAll
} = useData();
```

**Ejemplo de uso:**
```typescript
// Obtener lista
const { data: users, isLoading } = useDataList("users");

// Crear elemento
const { create, isLoading: createLoading } = useDataCreate("users");
await create({ firstName: "Juan", lastName: "Pérez" });

// Actualizar elemento
const { update, isLoading: updateLoading } = useDataUpdate("users");
await update({ id: 1, firstName: "Juan Carlos" });

// Eliminar elemento
const { delete: deleteUser, isLoading: deleteLoading } = useDataDelete("users");
await deleteUser(1);
```

### 🧭 Navegación (`use-navigation.hook.ts`)

Hook personalizado para navegación con funciones de utilidad:

```typescript
import { useNavigation } from '../hooks/use-navigation.hook';

const { 
  navigateTo,
  navigateToList,
  navigateToCreate,
  navigateToEdit,
  navigateToShow,
  navigateToDashboard,
  navigateToLogin,
  navigateBack,
  generateLink,
  generateListLink,
  generateCreateLink,
  generateEditLink,
  generateShowLink,
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
  navigateIfAllowed,
  navigateToListIfAllowed,
  navigateToCreateIfAllowed
} = useNavigation();
```

**Ejemplo de uso:**
```typescript
// Navegación básica
navigateToList("users");
navigateToCreate("users");
navigateToEdit("users", 1);
navigateToShow("users", 1);

// Navegación condicional
navigateToListIfAllowed("users", isAdmin());
navigateToCreateIfAllowed("users", isAdmin());

// Generar enlaces
const editLink = generateEditLink("users", 1);
const createLink = generateCreateLink("users");
```

### 🔧 Hooks Completos (`use-refine-hooks.hook.ts`)

Hook que centraliza todos los hooks de Refine en una sola interfaz:

```typescript
import { useRefineHooks } from '../hooks/use-refine-hooks.hook';

const {
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
  useNavigationOperations
} = useRefineHooks();
```

## 🎯 Hooks Combinados

### `useCrudOperations(resource)`
Hook que combina todas las operaciones CRUD para un recurso:

```typescript
const { list, create, update, delete: deleteItem, refresh } = useCrudOperations("users");
```

### `useAuthOperations()`
Hook que combina todas las operaciones de autenticación:

```typescript
const { identity, login, logout, isAuthenticated, permissions, onError } = useAuthOperations();
```

### `useNavigationOperations()`
Hook que combina todas las operaciones de navegación:

```typescript
const { navigation, go, back, parsed, link, getToPath, resourceParams } = useNavigationOperations();
```

## 📋 Hooks de Refine Implementados

### Data Hooks
- ✅ `useList` - Obtener listas
- ✅ `useOne` - Obtener un elemento
- ✅ `useMany` - Obtener múltiples elementos
- ✅ `useCreate` - Crear elemento
- ✅ `useCreateMany` - Crear múltiples elementos
- ✅ `useUpdate` - Actualizar elemento
- ✅ `useUpdateMany` - Actualizar múltiples elementos
- ✅ `useDelete` - Eliminar elemento
- ✅ `useDeleteMany` - Eliminar múltiples elementos
- ✅ `useCustom` - Operaciones personalizadas (GET)
- ✅ `useCustomMutation` - Operaciones personalizadas (POST/PUT/PATCH/DELETE)
- ✅ `useDataProvider` - Acceso al data provider
- ✅ `useApiUrl` - URL de la API
- ✅ `useInvalidate` - Invalidar queries
- ✅ `useShow` - Mostrar detalles
- ✅ `useTable` - Tablas
- ✅ `useForm` - Formularios
- ✅ `useSelect` - Selects
- ✅ `useInfiniteList` - Listas infinitas

### Authentication Hooks
- ✅ `useGetIdentity` - Obtener identidad del usuario
- ✅ `useLogin` - Iniciar sesión
- ✅ `useLogout` - Cerrar sesión
- ✅ `usePermissions` - Obtener permisos
- ✅ `useIsAuthenticated` - Verificar autenticación
- ✅ `useOnError` - Manejo de errores
- ✅ `useRegister` - Registro de usuarios
- ✅ `useForgotPassword` - Recuperar contraseña
- ✅ `useUpdatePassword` - Actualizar contraseña

### Routing Hooks
- ✅ `useNavigation` - Navegación
- ✅ `useGo` - Navegar a ruta
- ✅ `useBack` - Volver atrás
- ✅ `useParsed` - Parámetros parseados
- ✅ `useLink` - Generar enlaces
- ✅ `useGetToPath` - Obtener ruta de destino
- ✅ `useResourceParams` - Parámetros del recurso

### Notification Hooks
- ✅ `useNotification` - Notificaciones

### Authorization Hooks
- ✅ `useCan` - Verificar permisos específicos

## 🚀 Características Implementadas

### ✨ Mejores Prácticas
- **Manejo de errores**: Todos los hooks incluyen manejo de errores automático
- **Notificaciones**: Notificaciones automáticas para operaciones exitosas y errores
- **Loading states**: Estados de carga para todas las operaciones
- **Invalidación**: Invalidación automática de queries relacionadas
- **TypeScript**: Tipado completo para mejor experiencia de desarrollo

### 🔒 Seguridad
- **Validación de permisos**: Verificación de permisos antes de operaciones
- **Navegación condicional**: Navegación basada en permisos del usuario
- **Manejo de errores**: Manejo seguro de errores de autenticación

### 🎨 UX/UI
- **Notificaciones consistentes**: Mensajes de éxito y error estandarizados
- **Estados de carga**: Indicadores de carga para mejor UX
- **Navegación intuitiva**: Funciones de navegación fáciles de usar

## 📖 Ejemplo de Uso Completo

```typescript
import React from 'react';
import { Button, Card, Space } from 'antd';
import { useAuth, useData, useNavigation } from '../hooks';

const MyComponent: React.FC = () => {
  const { user, isAdmin, getUserFullName } = useAuth();
  const { useDataList, useDataCreate } = useData();
  const { navigateToCreate, navigateToList } = useNavigation();

  const { data: users, isLoading } = useDataList("users");
  const { create, isLoading: createLoading } = useDataCreate("users");

  const handleCreateUser = async () => {
    if (isAdmin()) {
      await create({
        firstName: "Nuevo",
        lastName: "Usuario",
        email: "nuevo@ejemplo.com"
      });
      navigateToList("users");
    }
  };

  return (
    <Card title={`Bienvenido, ${getUserFullName()}`}>
      <Space>
        <Button 
          type="primary" 
          loading={createLoading}
          onClick={handleCreateUser}
          disabled={!isAdmin()}
        >
          Crear Usuario
        </Button>
        <Button onClick={() => navigateToList("users")}>
          Ver Usuarios
        </Button>
      </Space>
    </Card>
  );
};
```

## 🔗 Referencias

- [Documentación oficial de Refine](https://refine.dev/docs/)
- [Hooks de Refine](https://refine.dev/docs/api-reference/core/hooks/)
- [Mejores prácticas de Refine](https://refine.dev/docs/guides-concepts/general-concepts/)

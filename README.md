# The Children's World - Sistema de Gestión de Guardería

Este es un sistema completo de gestión para guarderías y centros infantiles, construido con React, Refine.dev y conectado a una API de NestJS.

## 🚀 Características

- **Dashboard Principal**: Resumen de estadísticas y actividad diaria
- **Gestión de Usuarios**: Administración de usuarios con diferentes roles (Administrador, Educador, Padre)
- **Gestión de Niños**: Registro y administración de información de los niños
- **Sistema de Asistencia**: Check-in y check-out con seguimiento de horarios
- **Gestión de Incidentes**: Registro y seguimiento de incidentes
- **Calendario de Eventos**: Programación y gestión de actividades
- **Gestión de Documentos**: Almacenamiento y organización de documentos
- **Sistema de Mensajería**: Comunicación entre usuarios
- **Reportes**: Generación de reportes y estadísticas
- **Autenticación JWT**: Sistema seguro de login y permisos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19 + TypeScript
- **UI Framework**: Ant Design
- **Data Management**: Refine.dev
- **Data Provider**: @refinedev/nestjsx-crud
- **Routing**: React Router
- **Date Handling**: Moment.js
- **Build Tool**: Vite

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (versión 20 o superior)
- npm o yarn
- API de NestJS ejecutándose en el puerto 30000

## 🔧 Instalación

1. **Clona el repositorio** (si aplica) o navega al directorio del proyecto:
   ```bash
   cd data-provider-nestjsx-crud
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configura la API**:
   - Asegúrate de que tu API de NestJS esté ejecutándose en `http://localhost:30000`
   - Verifica que la API tenga configurado CORS para permitir conexiones desde el frontend
   - La API debe tener los siguientes endpoints disponibles:
     - `/api/auth/*` - Autenticación
     - `/api/users/*` - Gestión de usuarios
     - `/api/children/*` - Gestión de niños
     - `/api/attendance/*` - Sistema de asistencia
     - `/api/incidents/*` - Gestión de incidentes
     - `/api/calendar/*` - Eventos del calendario
     - `/api/documents/*` - Gestión de documentos
     - `/api/messaging/*` - Sistema de mensajería
     - `/api/reports/*` - Reportes

## 🚀 Ejecución

Para iniciar el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia la aplicación en modo producción
- `npm run refine` - Comandos de Refine CLI

## 📁 Estructura del Proyecto

```
src/
├── pages/                 # Páginas de la aplicación
│   ├── dashboard.tsx     # Dashboard principal
│   ├── users/           # Módulo de usuarios
│   ├── children/        # Módulo de niños
│   ├── attendance/      # Módulo de asistencia
│   ├── incidents/       # Módulo de incidentes
│   ├── calendar/        # Módulo de calendario
│   ├── documents/       # Módulo de documentos
│   ├── messaging/       # Módulo de mensajería
│   └── reports/         # Módulo de reportes
├── App.tsx              # Componente principal
├── authProvider.ts      # Proveedor de autenticación
├── dataProvider.ts      # Proveedor de datos personalizado
└── index.tsx           # Punto de entrada
```

## 🔐 Autenticación

El sistema utiliza autenticación JWT. Las credenciales se almacenan en localStorage y se incluyen automáticamente en todas las peticiones a la API.

### Roles de Usuario:
- **Administrator**: Acceso completo a todas las funciones
- **Educator**: Acceso a gestión de niños, asistencia, incidentes y calendario
- **Parent**: Acceso limitado a información de sus propios hijos

## 🎨 Funcionalidades por Módulo

### Dashboard
- Estadísticas generales del sistema
- Actividad del día actual
- Alertas de pago pendientes
- Accesos rápidos a funciones principales

### Usuarios
- Lista de usuarios con filtros y búsqueda
- Creación y edición de usuarios
- Gestión de roles y permisos
- Visualización de perfiles detallados

### Niños
- Registro completo de información infantil
- Cálculo automático de edades
- Alertas de pago
- Gestión de estados activos/inactivos

### Asistencia
- Check-in y check-out diarios
- Seguimiento de horarios
- Notas de entrada y salida
- Estadísticas de asistencia

## 🔧 Configuración

### URL de la API
La URL de la API está configurada en:
- `src/authProvider.ts`
- `src/dataProvider.ts`

Actualmente configurada para: `http://localhost:30000/api`

### Personalización de Temas
El tema de Ant Design se puede personalizar en `src/App.tsx`:
```tsx
<ConfigProvider theme={RefineThemes.Blue}>
```

## 🐛 Solución de Problemas

### La aplicación no se conecta a la API
1. Verifica que la API esté ejecutándose en el puerto 30000
2. Asegúrate de que CORS esté configurado correctamente en la API
3. Verifica que los endpoints de la API coincidan con los esperados

### Errores de autenticación
1. Verifica que el endpoint `/api/auth/login` esté funcionando
2. Comprueba que el JWT secret esté configurado correctamente en la API
3. Limpia localStorage si hay tokens corruptos

### Problemas de permisos
1. Verifica que el usuario tenga el rol correcto
2. Comprueba que los guards de la API estén configurados correctamente
3. Asegúrate de que el token JWT contenga la información de roles

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Si encuentras algún problema o tienes preguntas, por favor:
1. Revisa la documentación de [Refine.dev](https://refine.dev)
2. Consulta la documentación de [Ant Design](https://ant.design)
3. Crea un issue en el repositorio del proyecto

---

**¡Gracias por usar The Children's World! 🏫👶**
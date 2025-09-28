import { ResourceProps } from "@refinedev/core";

export const appResources: ResourceProps[] = [
  {
    name: "users",
    list: "/users",
    create: "/users/create",
    edit: "/users/edit/:id",
    meta: {
      label: "Usuarios",
      icon: "👥",
    },
  },
  {
    name: "children",
    list: "/children",
    create: "/children/create",
    edit: "/children/edit/:id",
    show: "/children/show/:id",
    meta: {
      label: "Niños",
      icon: "👶",
    },
  },
  {
    name: "attendance",
    list: "/attendance",
    create: "/attendance/create",
    show: "/attendance/show/:id",
    edit: "/attendance/edit/:id",
    meta: {
      label: "Asistencia",
      icon: "📋",
    },
  },
  {
    name: "attendance/daily-activities",
    list: "/attendance/activities",
    create: "/attendance/activities/create",
    edit: "/attendance/activities/edit/:id",
    show: "/attendance/activities/show/:id",
    meta: {
      label: "Actividades Diarias",
      icon: "✅",
    },
  },
  {
    name: "attendance/daily-observations",
    list: "/attendance/observations",
    create: "/attendance/observations/create",
    edit: "/attendance/observations/edit/:id",
    show: "/attendance/observations/show/:id",
    meta: {
      label: "Observaciones",
      icon: "👁️",
    },
  },
  {
    name: "attendance/activity-photos",
    list: "/attendance/photos",
    create: "/attendance/photos/create",
    edit: "/attendance/photos/edit/:id",
    show: "/attendance/photos/show/:id",
    meta: {
      label: "Fotos de Actividades",
      icon: "📷",
    },
  },
  {
    name: "incidents",
    list: "/incidents",
    create: "/incidents/create",
    edit: "/incidents/edit/:id",
    show: "/incidents/show/:id",
    meta: {
      label: "Incidentes",
      icon: "⚠️",
    },
  },
  {
    name: "calendar",
    list: "/calendar",
    create: "/calendar/create",
    edit: "/calendar/edit/:id",
    meta: {
      label: "Calendario",
      icon: "📅",
    },
  },
  {
    name: "documents",
    list: "/documents",
    create: "/documents/create",
    show: "/documents/show/:id",
    meta: {
      label: "Documentos",
      icon: "📄",
    },
  },
  {
    name: "reports",
    list: "/reports",
    meta: {
      label: "Reportes",
      icon: "📊",
    },
  },
];

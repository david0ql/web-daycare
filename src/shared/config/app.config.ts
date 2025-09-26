import { ResourceProps } from "@refinedev/core";

export const appResources: ResourceProps[] = [
  {
    name: "users",
    list: "/users",
    create: "/users/create",
    edit: "/users/edit/:id",
    show: "/users/show/:id",
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
    meta: {
      label: "Asistencia",
      icon: "📋",
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
    name: "messaging",
    list: "/messaging",
    create: "/messaging/create",
    show: "/messaging/show/:id",
    meta: {
      label: "Mensajes",
      icon: "💬",
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

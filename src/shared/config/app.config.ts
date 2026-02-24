import { ResourceProps } from "@refinedev/core";

import type { Language } from "../contexts/language.context";

const APP_RESOURCES_TRANSLATIONS = {
  english: {
    users: "Users",
    children: "Children",
    attendance: "Attendance",
    dailyActivities: "Daily Activities",
    observations: "Observations",
    activityPhotos: "Activity Photos",
    incidents: "Incidents",
    calendar: "Calendar",
    documents: "Documents",
    reports: "Reports",
  },
  spanish: {
    users: "Usuarios",
    children: "Niños",
    attendance: "Asistencia",
    dailyActivities: "Actividades diarias",
    observations: "Observaciones",
    activityPhotos: "Fotos de actividades",
    incidents: "Incidentes",
    calendar: "Calendario",
    documents: "Documentos",
    reports: "Reportes",
  },
} as const;

export const getAppResources = (language: Language): ResourceProps[] => {
  const t = APP_RESOURCES_TRANSLATIONS[language];

  return [
    {
      name: "users",
      list: "/users",
      create: "/users/create",
      edit: "/users/edit/:id",
      meta: {
        label: t.users,
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
        label: t.children,
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
        label: t.attendance,
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
        label: t.dailyActivities,
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
        label: t.observations,
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
        label: t.activityPhotos,
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
        label: t.incidents,
        icon: "⚠️",
      },
    },
    {
      name: "calendar",
      list: "/calendar",
      create: "/calendar/create",
      show: "/calendar/show/:id",
      edit: "/calendar/edit/:id",
      meta: {
        label: t.calendar,
        icon: "📅",
      },
    },
    {
      name: "documents",
      list: "/documents",
      create: "/documents/create",
      edit: "/documents/edit/:id",
      show: "/documents/show/:id",
      meta: {
        label: t.documents,
        icon: "📄",
      },
    },
    {
      name: "reports",
      list: "/reports",
      meta: {
        label: t.reports,
        icon: "📊",
      },
    },
  ];
};

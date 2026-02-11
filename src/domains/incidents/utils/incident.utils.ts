import dayjs from 'dayjs';
import type { Language } from '../../../shared/contexts/language.context';

const INCIDENT_UTILS_TRANSLATIONS = {
  english: {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    pending: "Pending",
    notified: "Notified",
    notNotified: "Not notified",
    image: "Image",
    document: "Document",
    file: "File",
  },
  spanish: {
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
    critical: "Crítico",
    pending: "Pendiente",
    notified: "Notificado",
    notNotified: "No notificado",
    image: "Imagen",
    document: "Documento",
    file: "Archivo",
  },
} as const;

export const getSeverityColor = (severityLevel: 'low' | 'medium' | 'high' | 'critical') => {
  switch (severityLevel) {
    case 'low':
      return 'green';
    case 'medium':
      return 'orange';
    case 'high':
      return 'red';
    case 'critical':
      return 'purple';
    default:
      return 'default';
  }
};

export const getSeverityLabel = (severityLevel: 'low' | 'medium' | 'high' | 'critical') => {
  const t = INCIDENT_UTILS_TRANSLATIONS.english;
  switch (severityLevel) {
    case 'low':
      return t.low;
    case 'medium':
      return t.medium;
    case 'high':
      return t.high;
    case 'critical':
      return t.critical;
    default:
      return severityLevel;
  }
};

export const getSeverityLabelByLanguage = (
  severityLevel: 'low' | 'medium' | 'high' | 'critical',
  language: Language = "english",
) => {
  const t = INCIDENT_UTILS_TRANSLATIONS[language];
  switch (severityLevel) {
    case 'low':
      return t.low;
    case 'medium':
      return t.medium;
    case 'high':
      return t.high;
    case 'critical':
      return t.critical;
    default:
      return severityLevel;
  }
};

export const formatIncidentDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatIncidentDateShort = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const getIncidentStatus = (parentNotified: boolean | null) => {
  return getIncidentStatusByLanguage(parentNotified, "english");
};

export const getIncidentStatusByLanguage = (parentNotified: boolean | null, language: Language = "english") => {
  const t = INCIDENT_UTILS_TRANSLATIONS[language];
  if (parentNotified === null) {
    return { status: 'default', text: t.pending };
  }
  return parentNotified 
    ? { status: 'success', text: t.notified }
    : { status: 'warning', text: t.notNotified };
};

export const getFileTypeIcon = (fileType: 'image' | 'document') => {
  switch (fileType) {
    case 'image':
      return '🖼️';
    case 'document':
      return '📄';
    default:
      return '📎';
  }
};

export const getFileTypeLabel = (fileType: 'image' | 'document') => {
  return getFileTypeLabelByLanguage(fileType, "english");
};

export const getFileTypeLabelByLanguage = (fileType: 'image' | 'document', language: Language = "english") => {
  const t = INCIDENT_UTILS_TRANSLATIONS[language];
  switch (fileType) {
    case 'image':
      return t.image;
    case 'document':
      return t.document;
    default:
      return t.file;
  }
};

export const getAttachmentUrl = (filePath: string) => {
  const token = localStorage.getItem('refine-auth');
  return `https://api.thechildrenworld.com/api/uploads/incident-attachments/${filePath.split('/').pop()}?token=${token}`;
};

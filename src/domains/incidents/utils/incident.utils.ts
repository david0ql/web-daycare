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

/** API incident type keys (name field). Used only for display; API always receives incidentTypeId. */
export type IncidentTypeKey =
  | 'minor_fall'
  | 'scrape_cut'
  | 'biting'
  | 'fever'
  | 'allergic_reaction'
  | 'serious_injury'
  | 'unauthorized_pickup'
  | 'behavioral_issue'
  | 'other';

const INCIDENT_TYPE_LABELS: Record<Language, Record<IncidentTypeKey, string>> = {
  english: {
    minor_fall: 'Minor fall or stumble',
    scrape_cut: 'Minor scrape or cut',
    biting: 'Child biting incident',
    fever: 'Child develops fever',
    allergic_reaction: 'Allergic reaction',
    serious_injury: 'Serious injury requiring medical attention',
    unauthorized_pickup: 'Unauthorized pickup attempt',
    behavioral_issue: 'Behavioral incident',
    other: 'Other incidents',
  },
  spanish: {
    minor_fall: 'Caída o tropiezo menor',
    scrape_cut: 'Rasguño o corte menor',
    biting: 'Incidente de mordida',
    fever: 'El niño presenta fiebre',
    allergic_reaction: 'Reacción alérgica',
    serious_injury: 'Lesión grave que requiere atención médica',
    unauthorized_pickup: 'Intento de recogida no autorizada',
    behavioral_issue: 'Incidente conductual',
    other: 'Otros incidentes',
  },
};

/**
 * Returns the display label for an incident type by its API key (name).
 * Use only for UI; API still uses incidentTypeId. Language change only affects display.
 */
export const getIncidentTypeLabelByLanguage = (
  typeName: string | undefined | null,
  language: Language = 'english',
): string => {
  if (!typeName) return '';
  const labels = INCIDENT_TYPE_LABELS[language];
  const key = typeName as IncidentTypeKey;
  return labels[key] ?? typeName;
};

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

/** Date by language (YYYY-MM-DD for Spanish, MM-DD-YYYY for English) and time in 12-hour format (AM/PM). */
export const formatIncidentDateByLanguage = (date: string, language: Language = 'english') => {
  const dateFormat = language === 'spanish' ? 'YYYY-MM-DD' : 'MM-DD-YYYY';
  return dayjs(date).format(`${dateFormat} h:mm A`);
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

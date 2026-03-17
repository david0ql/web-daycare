import dayjs from 'dayjs';
import { Document, DocumentType } from '../types/document.types';
import type { Language } from '../../../shared/contexts/language.context';
import { FLORIDA_TIMEZONE } from '../../../shared/i18n/locale';

const DOCUMENT_UTILS_TRANSLATIONS = {
  english: {
    noExpirationDate: "No expiration date",
    expired: "Expired",
    expiringSoon: "Expiring soon",
    expiring: "Expiring",
    valid: "Valid",
    expiredDaysAgo: "Expired",
    daysAgo: "days ago",
    expiresToday: "Expires today",
    expiresTomorrow: "Expires tomorrow",
    expiresIn: "Expires in",
    days: "days",
  },
  spanish: {
    noExpirationDate: "Sin fecha de expiración",
    expired: "Expirado",
    expiringSoon: "Por expirar",
    expiring: "Próximo a expirar",
    valid: "Vigente",
    expiredDaysAgo: "Expiró hace",
    daysAgo: "días",
    expiresToday: "Expira hoy",
    expiresTomorrow: "Expira mañana",
    expiresIn: "Expira en",
    days: "días",
  },
} as const;

// Formatear fecha de documento
export const formatDocumentDate = (date: string): string => {
  return dayjs(date).tz(FLORIDA_TIMEZONE).format('DD/MM/YYYY HH:mm');
};

/** Upload date: date by language (YYYY-MM-DD / MM-DD-YYYY) and time in 12h (AM/PM). */
export const formatDocumentDateByLanguage = (date: string, language: Language = "english"): string => {
  const dateFormat = language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY";
  return dayjs(date).tz(FLORIDA_TIMEZONE).format(`${dateFormat} h:mm A`);
};

// Formatear fecha de expiración (date format by language)
export const formatExpirationDate = (date: string | null, language: Language = "english"): string => {
  const t = DOCUMENT_UTILS_TRANSLATIONS[language];
  if (!date) return t.noExpirationDate;
  const dateFormat = language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY";
  return dayjs(date).format(dateFormat);
};

// Obtener color del estado de expiración
export const getExpirationColor = (document: Document): string => {
  if (document.isExpired) return 'red';
  if (document.daysUntilExpiration <= 30) return 'orange';
  if (document.daysUntilExpiration <= 90) return 'yellow';
  return 'green';
};

// Obtener etiqueta del estado de expiración
export const getExpirationLabel = (document: Document, language: Language = "english"): string => {
  const t = DOCUMENT_UTILS_TRANSLATIONS[language];
  if (document.isExpired) return t.expired;
  if (document.daysUntilExpiration <= 30) return t.expiringSoon;
  if (document.daysUntilExpiration <= 90) return t.expiring;
  return t.valid;
};

// Formatear tamaño de archivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Obtener tipo de archivo basado en MIME type
export const getFileType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentation';
  return 'file';
};

// Obtener icono basado en tipo de archivo
export const getFileIcon = (mimeType: string): string => {
  const fileType = getFileType(mimeType);
  
  switch (fileType) {
    case 'image':
      return '🖼️';
    case 'pdf':
      return '📄';
    case 'document':
      return '📝';
    case 'spreadsheet':
      return '📊';
    case 'presentation':
      return '📽️';
    default:
      return '📁';
  }
};

// Verificar si un tipo de documento puede ser subido múltiples veces
export const canUploadMultiple = (documentType: DocumentType): boolean => {
  return documentType.name.toLowerCase() === 'other';
};

// Obtener URL del documento
export const getDocumentUrl = (filename: string): string => {
  const token = localStorage.getItem('refine-auth');
  return `https://api.thechildrenworld.com/api/static/files/documents/${filename}/simple?token=${token}`;
};

// Verificar si un documento está próximo a expirar
export const isNearExpiration = (document: Document, days: number = 30): boolean => {
  return !document.isExpired && document.daysUntilExpiration <= days;
};

// Obtener días hasta expiración en formato legible
export const getDaysUntilExpirationText = (document: Document, language: Language = "english"): string => {
  const t = DOCUMENT_UTILS_TRANSLATIONS[language];
  if (document.isExpired) {
    return language === "spanish"
      ? `${t.expiredDaysAgo} ${Math.abs(document.daysUntilExpiration)} ${t.daysAgo}`
      : `${t.expired} ${Math.abs(document.daysUntilExpiration)} ${t.daysAgo}`;
  }
  
  if (document.daysUntilExpiration === 0) {
    return t.expiresToday;
  }
  
  if (document.daysUntilExpiration === 1) {
    return t.expiresTomorrow;
  }
  
  return `${t.expiresIn} ${document.daysUntilExpiration} ${t.days}`;
};

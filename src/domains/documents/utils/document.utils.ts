import dayjs from 'dayjs';
import { Document, DocumentType } from '../types/document.types';

// Formatear fecha de documento
export const formatDocumentDate = (date: string): string => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

// Formatear fecha de expiración
export const formatExpirationDate = (date: string | null): string => {
  if (!date) return 'Sin fecha de expiración';
  return dayjs(date).format('DD/MM/YYYY');
};

// Obtener color del estado de expiración
export const getExpirationColor = (document: Document): string => {
  if (document.isExpired) return 'red';
  if (document.daysUntilExpiration <= 30) return 'orange';
  if (document.daysUntilExpiration <= 90) return 'yellow';
  return 'green';
};

// Obtener etiqueta del estado de expiración
export const getExpirationLabel = (document: Document): string => {
  if (document.isExpired) return 'Expirado';
  if (document.daysUntilExpiration <= 30) return 'Por expirar';
  if (document.daysUntilExpiration <= 90) return 'Próximo a expirar';
  return 'Vigente';
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
export const getDaysUntilExpirationText = (document: Document): string => {
  if (document.isExpired) {
    return `Expirado hace ${Math.abs(document.daysUntilExpiration)} días`;
  }
  
  if (document.daysUntilExpiration === 0) {
    return 'Expira hoy';
  }
  
  if (document.daysUntilExpiration === 1) {
    return 'Expira mañana';
  }
  
  return `Expira en ${document.daysUntilExpiration} días`;
};

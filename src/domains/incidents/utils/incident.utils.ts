import dayjs from 'dayjs';

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
  switch (severityLevel) {
    case 'low':
      return 'Bajo';
    case 'medium':
      return 'Medio';
    case 'high':
      return 'Alto';
    case 'critical':
      return 'Crítico';
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
  if (parentNotified === null) {
    return { status: 'default', text: 'Pendiente' };
  }
  return parentNotified 
    ? { status: 'success', text: 'Notificado' }
    : { status: 'warning', text: 'No notificado' };
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
  switch (fileType) {
    case 'image':
      return 'Imagen';
    case 'document':
      return 'Documento';
    default:
      return 'Archivo';
  }
};

export const getAttachmentUrl = (filePath: string) => {
  const token = localStorage.getItem('refine-auth');
  return `http://localhost:30000/api/uploads/incident-attachments/${filePath.split('/').pop()}?token=${token}`;
};

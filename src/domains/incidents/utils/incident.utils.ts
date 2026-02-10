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
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
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
    return { status: 'default', text: 'Pending' };
  }
  return parentNotified 
    ? { status: 'success', text: 'Notified' }
    : { status: 'warning', text: 'Not notified' };
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
      return 'Image';
    case 'document':
      return 'Document';
    default:
      return 'File';
  }
};

export const getAttachmentUrl = (filePath: string) => {
  const token = localStorage.getItem('refine-auth');
  return `https://api.thechildrenworld.com/api/uploads/incident-attachments/${filePath.split('/').pop()}?token=${token}`;
};

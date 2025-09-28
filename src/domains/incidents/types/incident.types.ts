export interface Incident {
  id: number;
  childId: number;
  incidentTypeId: number;
  title: string;
  description: string;
  incidentDate: string;
  location?: string;
  actionTaken?: string;
  parentNotified: boolean | null;
  parentNotifiedAt: string | null;
  reportedBy: number;
  createdAt: string;
  updatedAt: string;
  child?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  incidentType?: {
    id: number;
    name: string;
    description?: string;
    severityLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  reportedBy2?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  incidentAttachments?: IncidentAttachment[];
}

export interface IncidentType {
  id: number;
  name: string;
  description?: string;
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

export interface IncidentAttachment {
  id: number;
  incidentId: number;
  filename: string;
  filePath: string;
  fileType: 'image' | 'document';
  uploadedBy: number;
  createdAt: string;
  uploadedBy2?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateIncidentRequest {
  childId: number;
  incidentTypeId: number;
  title: string;
  description: string;
  incidentDate: string;
  location?: string;
  actionTaken?: string;
}

export interface UpdateIncidentRequest extends Partial<CreateIncidentRequest> {}

export interface MarkParentNotifiedRequest {
  incidentId: number;
}

export interface CreateIncidentAttachmentRequest {
  incidentId: number;
  filename: string;
  filePath: string;
  fileType: 'image' | 'document';
}

export interface IncidentFilters {
  childId?: number;
  incidentTypeId?: number;
  severityLevel?: 'low' | 'medium' | 'high' | 'critical';
  parentNotified?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

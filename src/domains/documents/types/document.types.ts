export interface Document {
  id: number;
  childId: number;
  documentTypeId: number;
  filename: string;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: number;
  createdAt: string;
  expiresAt: string | null;
  child: {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: string;
  };
  documentType: {
    id: number;
    name: string;
    description: string | null;
    retentionDays: number | null;
  };
  uploadedBy2: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  isExpired: boolean;
  daysUntilExpiration: number;
}

export interface DocumentType {
  id: number;
  name: string;
  description: string | null;
  retentionDays: number | null;
  createdAt: string;
}

export interface CreateDocumentData {
  childId: number;
  documentTypeId: number;
  filename: string;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  expiresAt?: string;
}

export interface UpdateDocumentData {
  childId?: number;
  documentTypeId?: number;
  expiresAt?: string;
}

export interface DocumentTypeWithCount extends DocumentType {
  documentCount: number;
}

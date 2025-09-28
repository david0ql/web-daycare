export interface ActivityPhoto {
  id: number;
  childId: number;
  attendanceId: number;
  filename: string;
  filePath: string;
  caption?: string;
  uploadedBy: number;
  createdAt: string;
  // Relations
  child?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  attendance?: {
    id: number;
    attendanceDate: string;
  };
  uploadedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateActivityPhotoData {
  childId: number;
  attendanceId: number;
  caption?: string;
}

export interface UpdateActivityPhotoData extends Partial<CreateActivityPhotoData> {}

export interface ActivityPhotoUpload {
  file: File;
  caption?: string;
}

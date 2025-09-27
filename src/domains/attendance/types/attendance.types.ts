export interface Attendance {
  id: number;
  childId: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  isPresent: boolean;
  notes?: string;
  deliveredBy?: number;
  pickedUpBy?: number;
  createdBy: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  child?: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  deliveredByPerson?: {
    id: number;
    name: string;
    relationship: string;
    phone: string;
  };
  pickedUpByPerson?: {
    id: number;
    name: string;
    relationship: string;
    phone: string;
  };
  createdByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  updatedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateAttendanceData {
  childId: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  isPresent: boolean;
  notes?: string;
  deliveredBy?: number;
  pickedUpBy?: number;
}

export interface UpdateAttendanceData {
  attendanceDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  isPresent?: boolean;
  notes?: string;
  deliveredBy?: number;
  pickedUpBy?: number;
}

export interface CheckInData {
  childId: number;
  deliveredBy?: number;
  notes?: string;
}

export interface CheckOutData {
  childId: number;
  pickedUpBy?: number;
  notes?: string;
}

export interface AttendanceStatus {
  isPresent: boolean;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  attendance?: Attendance;
}

export interface AttendanceStats {
  totalChildren: number;
  presentToday: number;
  checkedIn: number;
  checkedOut: number;
  absentToday: number;
  attendanceRate: number;
}

export interface ChildWithStatus {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  attendanceStatus: AttendanceStatus;
}

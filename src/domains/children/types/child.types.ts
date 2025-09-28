export interface ParentChildRelationship {
  id: number;
  parentId: number;
  childId: number;
  relationshipType: 'father' | 'mother' | 'guardian' | 'other';
  isPrimary: boolean;
  parent?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface EmergencyContact {
  id: number;
  childId: number;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface AuthorizedPickupPerson {
  id: number;
  childId: number;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  photo?: string;
  idDocument?: string;
}

export interface MedicalInformation {
  id: number;
  childId: number;
  allergies?: string;
  medications?: string;
  insuranceCompany?: string;
  insuranceNumber?: string;
  pediatricianName?: string;
  pediatricianPhone?: string;
  additionalNotes?: string;
}

export interface Child {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthCity?: string;
  profilePicture?: string;
  address?: string;
  hasPaymentAlert: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parentChildRelationships?: ParentChildRelationship[];
  emergencyContacts?: EmergencyContact[];
  authorizedPickupPersons?: AuthorizedPickupPerson[];
  medicalInformation?: MedicalInformation;
}

export interface CreateChildData {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthCity?: string;
  profilePicture?: string;
  address?: string;
  hasPaymentAlert?: boolean;
  isActive?: boolean;
  parentRelationships?: {
    parentId: number;
    relationshipType: 'father' | 'mother' | 'guardian' | 'other';
    isPrimary?: boolean;
  }[];
  emergencyContacts?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary?: boolean;
  }[];
  authorizedPickupPersons?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    photo?: string;
    idDocument?: string;
  }[];
  medicalInformation?: {
    allergies?: string;
    medications?: string;
    insuranceCompany?: string;
    insuranceNumber?: string;
    pediatricianName?: string;
    pediatricianPhone?: string;
    additionalNotes?: string;
  };
}

export interface UpdateChildData extends Partial<CreateChildData> {
  id: number;
}

// Aliases for backward compatibility
export type CreateChildRequest = CreateChildData;
export type UpdateChildRequest = UpdateChildData;

export interface ChildListResponse {
  data: Child[];
  total: number;
  page: number;
  limit: number;
}

export interface AvailableParent {
  id: number;
  name: string;
  email: string;
  phone: string;
}
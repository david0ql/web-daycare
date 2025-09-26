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
  parent?: ChildParent;
  category?: ChildCategory;
}

export interface ChildParent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface ChildCategory {
  id: number;
  name: string;
  description?: string;
  ageRange: string;
}

export interface CreateChildRequest {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthCity?: string;
  address?: string;
  parentId?: number;
  categoryId?: number;
  isActive?: boolean;
}

export interface UpdateChildRequest {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  birthCity?: string;
  address?: string;
  parentId?: number;
  categoryId?: number;
  isActive?: boolean;
}

export interface ChildListResponse {
  data: Child[];
  meta: {
    total: number;
    page: number;
    take: number;
  };
}

export interface ChildFilters {
  category?: string;
  isActive?: boolean;
  hasPaymentAlert?: boolean;
  search?: string;
}

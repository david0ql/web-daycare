export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: number;
  name: string;
  description: string | null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: number;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface UserListResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    take: number;
  };
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
}

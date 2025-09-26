export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface AuthError {
  name: string;
  message: string;
}

export interface AuthResult {
  success: boolean;
  error?: AuthError;
  redirectTo?: string;
}

export interface AuthCheckResult {
  authenticated: boolean;
  redirectTo?: string;
}

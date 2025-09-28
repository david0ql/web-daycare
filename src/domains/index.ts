// Domain exports - avoid conflicts by using explicit exports
export { authProvider, AuthApi, AuthUtils } from './auth';
export { UserApi, UserUtils, UserList, useActiveUsers, useUsersByRole } from './users';
export * from './children';

// Types with explicit naming to avoid conflicts
export type {
  LoginCredentials,
  LoginResponse,
  User as AuthUser,
  UserRole as AuthUserRole,
  AuthError,
  AuthResult,
  AuthCheckResult,
} from './auth';

export type {
  User as DomainUser,
  UserRole as DomainUserRole,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  UserFilters,
} from './users';

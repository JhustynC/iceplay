/**
 * User roles in the system
 * - super_admin: Fropen employee with full system access
 * - admin: Organization administrator managing their own league
 */
export type UserRole = 'super_admin' | 'admin';

/**
 * User entity representing authenticated users
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string; // Only for admin role
  avatar?: string;
  phone?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

/**
 * Authentication state managed by AuthService
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Login request payload
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response from API
 */
export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

/**
 * DTO for creating a new admin user
 */
export interface CreateAdminDto {
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  phone?: string;
}


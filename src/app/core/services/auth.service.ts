import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import type { User, UserRole, LoginCredentials, AuthState, AuthResponse } from '../models';

const STORAGE_KEYS = {
  TOKEN: 'iceplay-token',
  USER: 'iceplay-user',
} as const;

// Mock users for development
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'super-1',
    email: 'super@fropen.com',
    password: 'admin123',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    role: 'super_admin',
    avatar: undefined,
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
    isActive: true,
  },
  {
    id: 'admin-1',
    email: 'admin@ligaquito.com',
    password: 'admin123',
    firstName: 'María',
    lastName: 'García',
    role: 'admin',
    organizationId: 'org-1',
    avatar: undefined,
    createdAt: new Date('2024-06-01'),
    lastLoginAt: new Date(),
    isActive: true,
  },
  {
    id: 'admin-2',
    email: 'admin@ligaguayaquil.com',
    password: 'admin123',
    firstName: 'Juan',
    lastName: 'Pérez',
    role: 'admin',
    organizationId: 'org-2',
    avatar: undefined,
    createdAt: new Date('2024-06-15'),
    lastLoginAt: new Date(),
    isActive: true,
  },
];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Private state
  private readonly _user = signal<User | null>(this.loadUserFromStorage());
  private readonly _token = signal<string | null>(this.loadTokenFromStorage());
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public computed values
  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isAuthenticated = computed(() => !!this._user() && !!this._token());
  readonly isSuperAdmin = computed(() => this._user()?.role === 'super_admin');
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly userFullName = computed(() => {
    const user = this._user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });
  readonly userInitials = computed(() => {
    const user = this._user();
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });
  readonly organizationId = computed(() => this._user()?.organizationId);

  // Get current state as object
  readonly state = computed<AuthState>(() => ({
    user: this._user(),
    token: this._token(),
    isAuthenticated: this.isAuthenticated(),
    isLoading: this._isLoading(),
    error: this._error(),
  }));

  constructor(private router: Router) {
    // Persist auth state to localStorage
    effect(() => {
      const user = this._user();
      const token = this._token();

      if (user && token) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    });
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Simulate API delay
      await this.delay(800);

      // Find user in mock data
      const mockUser = MOCK_USERS.find(
        (u) => u.email === credentials.email && u.password === credentials.password,
      );

      if (!mockUser) {
        throw new Error('Credenciales inválidas');
      }

      if (!mockUser.isActive) {
        throw new Error('Esta cuenta está desactivada');
      }

      // Create response without password
      const { password, ...user } = mockUser;
      const response: AuthResponse = {
        user: { ...user, lastLoginAt: new Date() },
        token: this.generateMockToken(user.id),
        expiresIn: 86400, // 24 hours
      };

      this._user.set(response.user);
      this._token.set(response.token);
      this._isLoading.set(false);

      // Navigate based on role
      this.navigateAfterLogin(response.user.role);

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      this._error.set(message);
      this._isLoading.set(false);
      return false;
    }
  }

  /**
   * Logout and clear session
   */
  logout(): void {
    this._user.set(null);
    this._token.set(null);
    this._error.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this._user()?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this._user()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Get redirect URL based on user role
   */
  getDefaultRoute(): string {
    const role = this._user()?.role;
    switch (role) {
      case 'super_admin':
        return '/super-admin';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this._error.set(null);
  }

  // Private methods

  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        const user = JSON.parse(stored) as User;
        // Convert date strings back to Date objects
        user.createdAt = new Date(user.createdAt);
        if (user.lastLoginAt) {
          user.lastLoginAt = new Date(user.lastLoginAt);
        }
        return user;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    return null;
  }

  private loadTokenFromStorage(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  private generateMockToken(userId: string): string {
    const payload = {
      sub: userId,
      iat: Date.now(),
      exp: Date.now() + 86400000, // 24 hours
    };
    return btoa(JSON.stringify(payload));
  }

  private navigateAfterLogin(role: UserRole): void {
    switch (role) {
      case 'super_admin':
        this.router.navigate(['/super-admin']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}


import { Injectable, signal, inject, computed } from '@angular/core';
import { ApiService } from './api.service';
import { tap, map, finalize, catchError, of, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Public signals
  user = this._currentUser.asReadonly();
  private _tokenSignal = this._token.asReadonly();

  // Alias for backward compatibility
  get currentUser() {
    return this.user;
  }

  // Public methods
  token() {
    return this._tokenSignal();
  }

  // Computed signals
  private _isAuthenticated = computed(() => this._currentUser() !== null);
  private _isAdmin = computed(() => {
    const user = this._currentUser();
    return user?.role === 'admin';
  });
  private _isSuperAdmin = computed(() => {
    const user = this._currentUser();
    return user?.role === 'super_admin';
  });
  private _userFullName = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  });
  private _userInitials = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    const first = user.firstName?.charAt(0).toUpperCase() || '';
    const last = user.lastName?.charAt(0).toUpperCase() || '';
    return first + last || user.email.charAt(0).toUpperCase();
  });
  private _getDefaultRoute = computed(() => {
    const user = this._currentUser();
    if (!user) return '/auth/login';
    if (user.role === 'super_admin') return '/super-admin';
    return '/admin/dashboard';
  });

  // Public methods that return computed signals
  isAuthenticated() {
    return this._isAuthenticated();
  }

  isAdmin() {
    return this._isAdmin();
  }

  isSuperAdmin() {
    return this._isSuperAdmin();
  }

  userFullName() {
    return this._userFullName();
  }

  userInitials() {
    return this._userInitials();
  }

  getDefaultRoute() {
    return this._getDefaultRoute();
  }

  async login(credentials: { email: string; password?: string }): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const users = await firstValueFrom(
        this.api.get<User[]>('users', { email: credentials.email }),
      );

      if (users.length === 0) {
        throw new Error('Credenciales inválidas');
      }

      const user = users[0];
      
      //? Ensure dates are properly parsed
      if (typeof user.createdAt === 'string') {
        user.createdAt = new Date(user.createdAt);
      }
      if (user.lastLoginAt && typeof user.lastLoginAt === 'string') {
        user.lastLoginAt = new Date(user.lastLoginAt);
      } 

      //? Generate a mock token (in real app, this comes from backend)
      const mockToken = `mock-token-${user.id}-${Date.now()}`;
      this._token.set(mockToken);
      this._currentUser.set(user);

      //? Redirect based on role
      if (user.role === 'super_admin') {
        this.router.navigate(['/super-admin']);
      } else {
        this.router.navigate(['/admin/dashboard']);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      this.error.set(errorMessage);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  logout() {
    this._currentUser.set(null);
    this._token.set(null);
    this.router.navigate(['/auth/login']);
  }

  clearError() {
    this.error.set(null);
  }
}

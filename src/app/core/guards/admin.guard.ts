import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard that checks if user has admin or super_admin role
 * Redirects to home page if not authorized
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin() || authService.isSuperAdmin()) {
    return true;
  }

  return router.createUrlTree(['/']);
};


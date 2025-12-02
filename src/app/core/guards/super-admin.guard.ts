import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard that checks if user has super_admin role
 * Redirects to appropriate page based on role
 */
export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isSuperAdmin()) {
    return true;
  }

  // If admin, redirect to admin panel
  if (authService.isAdmin()) {
    return router.createUrlTree(['/admin']);
  }

  // Otherwise redirect to home
  return router.createUrlTree(['/']);
};


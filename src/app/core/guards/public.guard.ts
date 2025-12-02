import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard for public-only pages (like login)
 * Redirects authenticated users to their dashboard
 */
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect based on user role
  const defaultRoute = authService.getDefaultRoute();
  return router.createUrlTree([defaultRoute]);
};


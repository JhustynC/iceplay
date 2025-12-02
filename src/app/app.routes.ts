import type { Routes } from '@angular/router';
import { authGuard, adminGuard, superAdminGuard, publicGuard } from './core/guards';

export const routes: Routes = [
  // Auth routes (login) - only for non-authenticated users
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () => import('./features/auth/auth.routes'),
  },

  // Super Admin routes - requires super_admin role
  {
    path: 'super-admin',
    canActivate: [authGuard, superAdminGuard],
    loadChildren: () => import('./features/super-admin/super-admin.routes'),
  },

  // Admin routes - requires admin or super_admin role
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes'),
  },

  // Public routes (existing)
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'matches',
  },
  {
    path: 'match/:matchId',
    loadComponent: () => import('./features/matches/pages/match-details/match-details'),
    title: 'Match Details',
  },
  {
    path: 'live-match',
    loadComponent: () => import('./features/matches/pages/live-match-logger/live-match-logger'),
    title: 'Live Match Logger',
  },
  {
    path: 'matches',
    loadComponent: () => import('./features/matches/pages/matches-list/matches-list'),
    title: 'Matches',
  },
  {
    path: 'ui-showcase',
    loadComponent: () =>
      import('./features/ui-dumb/pages/ui-showcase.page').then((m) => m.UiShowcasePage),
    title: 'UI Showcase - IcePlay',
  },

  // Catch-all redirect
  {
    path: '**',
    redirectTo: 'matches',
  },
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'matches',
  },
  {
    path: 'match/:matchId',
    loadComponent: () => import('./pages/match-details/match-details'),
    title: 'Match Details',
  },
  {
    path: 'live-match',
    loadComponent: () => import('./pages/live-match-logger/live-match-logger'),
    title: 'Live Match Logger',
  },
  {
    path: 'matches',
    loadComponent: () => import('./pages/matches-list/matches-list'),
    title: 'Matches',
  },
  {
    path: 'ui-showcase',
    loadComponent: () =>
      import('./pages/ui-showcase/ui-showcase.page').then((m) => m.UiShowcasePage),
    title: 'UI Showcase - IcePlay',
  },
  {
    path: '**',
    redirectTo: 'matches',
  },
];

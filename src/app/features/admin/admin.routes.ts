import type { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/admin-layout'),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page'),
        title: 'Dashboard - Admin',
      },
      {
        path: 'championships',
        loadComponent: () => import('./pages/championships/championships-list.page'),
        title: 'Campeonatos - Admin',
      },
      {
        path: 'championships/new',
        loadComponent: () => import('./pages/championships/championship-form.page'),
        title: 'Nuevo Campeonato - Admin',
      },
      {
        path: 'championships/:id',
        loadComponent: () => import('./pages/championships/championship-detail.page'),
        title: 'Detalle Campeonato - Admin',
      },
      {
        path: 'teams',
        loadComponent: () => import('./pages/teams/teams-list.page'),
        title: 'Equipos - Admin',
      },
      {
        path: 'teams/new',
        loadComponent: () => import('./pages/teams/team-form.page'),
        title: 'Nuevo Equipo - Admin',
      },
      {
        path: 'teams/:id',
        loadComponent: () => import('./pages/teams/team-detail.page'),
        title: 'Detalle Equipo - Admin',
      },
      {
        path: 'players',
        loadComponent: () => import('./pages/players/players-list.page'),
        title: 'Jugadores - Admin',
      },
      {
        path: 'players/new',
        loadComponent: () => import('./pages/players/player-form.page'),
        title: 'Nuevo Jugador - Admin',
      },
      {
        path: 'fixtures',
        loadComponent: () => import('./pages/fixtures/fixtures-list.page'),
        title: 'Fixture - Admin',
      },
      {
        path: 'fixtures/generate',
        loadComponent: () => import('./pages/fixtures/fixture-generator.page'),
        title: 'Generar Fixture - Admin',
      },
      {
        path: 'matches',
        loadComponent: () => import('./pages/matches/matches-list.page'),
        title: 'Partidos - Admin',
      },
      {
        path: 'match/:matchId/control',
        loadComponent: () => import('./pages/match-control/match-control.page'),
        title: 'Control de Partido - Admin',
      },
      {
        path: 'standings',
        loadComponent: () => import('./pages/standings/standings.page'),
        title: 'Tabla de Posiciones - Admin',
      },
      {
        path: 'statistics',
        loadComponent: () => import('./pages/statistics/statistics.page'),
        title: 'Estadísticas - Admin',
      },
    ],
  },
];

export default routes;


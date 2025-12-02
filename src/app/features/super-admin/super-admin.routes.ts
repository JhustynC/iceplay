import type { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/super-admin-layout'),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page'),
        title: 'Dashboard - Super Admin',
      },
      {
        path: 'organizations',
        loadComponent: () => import('./pages/organizations/organizations-list.page'),
        title: 'Organizaciones - Super Admin',
      },
      {
        path: 'organizations/new',
        loadComponent: () => import('./pages/organizations/organization-form.page'),
        title: 'Nueva Organización - Super Admin',
      },
      {
        path: 'organizations/:id',
        loadComponent: () => import('./pages/organizations/organization-detail.page'),
        title: 'Detalle Organización - Super Admin',
      },
      {
        path: 'announcements',
        loadComponent: () => import('./pages/announcements/announcements-list.page'),
        title: 'Anuncios - Super Admin',
      },
      {
        path: 'announcements/new',
        loadComponent: () => import('./pages/announcements/announcement-form.page'),
        title: 'Nuevo Anuncio - Super Admin',
      },
      {
        path: 'admins',
        loadComponent: () => import('./pages/admins/admins-list.page'),
        title: 'Administradores - Super Admin',
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.page'),
        title: 'Reportes - Super Admin',
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.page'),
        title: 'Configuración - Super Admin',
      },
    ],
  },
];

export default routes;


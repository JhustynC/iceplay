import type { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page'),
    title: 'Iniciar Sesión - IcePlay',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

export default routes;


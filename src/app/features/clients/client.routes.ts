import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/client-list/client-list.component').then(m => m.ClientListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/client-form/client-form.component').then(m => m.ClientFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/client-form/client-form.component').then(m => m.ClientFormComponent)
  }
];

export default [
  {
    path: 'clients',
    canActivate: [authGuard],
    children: CLIENT_ROUTES
  }
] satisfies Routes;

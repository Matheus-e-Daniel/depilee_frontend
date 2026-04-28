import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const SERVICE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/service-list/service-list.component').then(m => m.ServiceListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/service-form/service-form.component').then(m => m.ServiceFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/service-form/service-form.component').then(m => m.ServiceFormComponent)
  }
];

export default [
  {
    path: 'services',
    canActivate: [authGuard],
    children: SERVICE_ROUTES
  }
] satisfies Routes;

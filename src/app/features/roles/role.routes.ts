// src/app/features/roles/role.routes.ts
import { Routes } from '@angular/router';

export const ROLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/role-list/role-list.component').then(m => m.RoleListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/role-form/role-form.component').then(m => m.RoleFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/role-form/role-form.component').then(m => m.RoleFormComponent)
  }
];

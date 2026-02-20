// src/app/features/brands/brand.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { permissionGuard } from '../../core/guards/permission.guard';

export const BRAND_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/brand-list/brand-list.component').then(m => m.BrandListComponent),
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['Brand.Get'] }
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/brand-form/brand-form.component').then(m => m.BrandFormComponent),
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['Brand.Create'] }
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/brand-form/brand-form.component').then(m => m.BrandFormComponent),
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['Brand.Edit'] }
  }
];

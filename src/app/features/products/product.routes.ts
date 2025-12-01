import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/product-form/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/product-form/product-form.component').then(m => m.ProductFormComponent)
  }
];

// Exportamos também como rotas principais para incluir no app.routes.ts
export default [
  {
    path: 'products',
    canActivate: [authGuard],
    children: PRODUCT_ROUTES
  }
] satisfies Routes;

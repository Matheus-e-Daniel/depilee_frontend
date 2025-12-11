// src/app/features/service-order-items/service-order-items.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const SERVICE_ORDER_ITEM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/service-order-item-list/service-order-item-list.component').then(m => m.ServiceOrderItemListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/service-order-item-form/service-order-item-form.component').then(m => m.ServiceOrderItemFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/service-order-item-form/service-order-item-form.component').then(m => m.ServiceOrderItemFormComponent)
  }
];

// Para uso no app.routes.ts
export default [
  {
    path: 'service-order-items',
    canActivate: [authGuard],
    children: SERVICE_ORDER_ITEM_ROUTES
  }
] satisfies Routes;

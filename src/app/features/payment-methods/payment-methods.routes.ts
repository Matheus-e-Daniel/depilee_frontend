// src/app/features/payment-methods/payment-methods.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PAYMENT_METHOD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/payment-method-list/payment-method-list.component').then(m => m.PaymentMethodListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/payment-method-form/payment-method-form.component').then(m => m.PaymentMethodFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/payment-method-form/payment-method-form.component').then(m => m.PaymentMethodFormComponent)
  }
];

// Para uso no app.routes.ts
export default [
  {
    path: 'payment-methods',
    canActivate: [authGuard],
    children: PAYMENT_METHOD_ROUTES
  }
] satisfies Routes;

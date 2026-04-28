import { Routes } from '@angular/router';

export const SERVICE_ORDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/service-order-list/service-order-list.component').then(
        (m) => m.ServiceOrderListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/service-order-form/service-order-form.component').then(
        (m) => m.ServiceOrderFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/service-order-form/service-order-form.component').then(
        (m) => m.ServiceOrderFormComponent
      ),
  },
];

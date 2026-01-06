import { Routes } from '@angular/router';

export const CASH_REGISTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cash-register-list/cash-register-list.component').then(m => m.CashRegisterListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/cash-register-form/cash-register-form.component').then(m => m.CashRegisterFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/cash-register-form/cash-register-form.component').then(m => m.CashRegisterFormComponent)
  }
];

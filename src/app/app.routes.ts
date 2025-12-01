// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [],
    loadComponent: () =>
      import('./features/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Produtos
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/pages/product-list/product-list.component')
            .then(m => m.ProductListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/products/pages/product-form/product-form.component')
            .then(m => m.ProductFormComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () =>
          import('./features/products/pages/product-form/product-form.component')
            .then(m => m.ProductFormComponent)
      },
      // Clientes
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/pages/client-list/client-list.component')
            .then(m => m.ClientListComponent)
      },
      {
        path: 'clients/new',
        loadComponent: () =>
          import('./features/clients/pages/client-form/client-form.component')
            .then(m => m.ClientFormComponent)
      },
      {
        path: 'clients/edit/:id',
        loadComponent: () =>
          import('./features/clients/pages/client-form/client-form.component')
            .then(m => m.ClientFormComponent)
      },
      // Serviços
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/pages/service-list/service-list.component')
            .then(m => m.ServiceListComponent)
      },
      {
        path: 'services/new',
        loadComponent: () =>
          import('./features/services/pages/service-form/service-form.component')
            .then(m => m.ServiceFormComponent)
      },
      {
        path: 'services/edit/:id',
        loadComponent: () =>
          import('./features/services/pages/service-form/service-form.component')
            .then(m => m.ServiceFormComponent)
      },
      // Redirecionamento padrão
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

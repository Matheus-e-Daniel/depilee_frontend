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
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Rotas de produtos
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
      // Rotas de clientes
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
      // Rotas de serviços
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
      // Rotas de itens da ordem de serviço (adicionadas)
      {
        path: 'service-order-items',
        loadComponent: () =>
          import('./features/service-order-items/pages/service-order-item-list/service-order-item-list.component')
            .then(m => m.ServiceOrderItemListComponent)
      },
      {
        path: 'service-order-items/new',
        loadComponent: () =>
          import('./features/service-order-items/pages/service-order-item-form/service-order-item-form.component')
            .then(m => m.ServiceOrderItemFormComponent)
      },
      {
        path: 'service-order-items/edit/:id',
        loadComponent: () =>
          import('./features/service-order-items/pages/service-order-item-form/service-order-item-form.component')
            .then(m => m.ServiceOrderItemFormComponent)
      },
      // Rotas de marcas
      {
        path: 'brands',
        loadComponent: () =>
          import('./features/brands/pages/brand-list/brand-list.component')
            .then(m => m.BrandListComponent)
      },
      {
        path: 'brands/new',
        loadComponent: () =>
          import('./features/brands/pages/brand-form/brand-form.component')
            .then(m => m.BrandFormComponent)
      },
      {
        path: 'brands/:id/edit',
        loadComponent: () =>
          import('./features/brands/pages/brand-form/brand-form.component')
            .then(m => m.BrandFormComponent)
      },
      // Rotas de categorias
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/pages/category-list/category-list.component')
            .then(m => m.CategoryListComponent)
      },
      {
        path: 'categories/new',
        loadComponent: () =>
          import('./features/categories/pages/category-form/category-form.component')
            .then(m => m.CategoryFormComponent)
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () =>
          import('./features/categories/pages/category-form/category-form.component')
            .then(m => m.CategoryFormComponent)
      },
      // Rota de calendário de eventos
      {
        path: 'calendar-events',
        loadComponent: () =>
          import('./features/calendar-events/calendar-events.component')
            .then(m => m.CalendarEventsComponent)
      },
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

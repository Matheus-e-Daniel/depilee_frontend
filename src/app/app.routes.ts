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
      // Rotas de ordens de serviço
      {
        path: 'service-orders',
        loadComponent: () =>
          import('./features/service-orders/pages/service-order-list/service-order-list.component')
            .then(m => m.ServiceOrderListComponent)
      },
      {
        path: 'service-orders/new',
        loadComponent: () =>
          import('./features/service-orders/pages/service-order-form/service-order-form.component')
            .then(m => m.ServiceOrderFormComponent)
      },
      {
        path: 'service-orders/edit/:id',
        loadComponent: () =>
          import('./features/service-orders/pages/service-order-form/service-order-form.component')
            .then(m => m.ServiceOrderFormComponent)
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
      // Rotas de caixas
      {
        path: 'cash-registers',
        loadComponent: () =>
          import('./features/cash-registers/pages/cash-register-list/cash-register-list.component')
            .then(m => m.CashRegisterListComponent)
      },
      {
        path: 'cash-registers/new',
        loadComponent: () =>
          import('./features/cash-registers/pages/cash-register-form/cash-register-form.component')
            .then(m => m.CashRegisterFormComponent)
      },
      {
        path: 'cash-registers/:id/edit',
        loadComponent: () =>
          import('./features/cash-registers/pages/cash-register-form/cash-register-form.component')
            .then(m => m.CashRegisterFormComponent)
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
      // Rotas de usuários
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/pages/user-list/user-list.component')
            .then(m => m.UserListComponent)
      },
      {
        path: 'users/new',
        loadComponent: () =>
          import('./features/users/pages/user-form/user-form.component')
            .then(m => m.UserFormComponent)
      },
      {
        path: 'users/edit/:id',
        loadComponent: () =>
          import('./features/users/pages/user-form/user-form.component')
            .then(m => m.UserFormComponent)
      },
      // Rotas de métodos de pagamento
      {
        path: 'payment-methods',
        loadComponent: () =>
          import('./features/payment-methods/pages/payment-method-list/payment-method-list.component')
            .then(m => m.PaymentMethodListComponent)
      },
      {
        path: 'payment-methods/new',
        loadComponent: () =>
          import('./features/payment-methods/pages/payment-method-form/payment-method-form.component')
            .then(m => m.PaymentMethodFormComponent)
      },
      {
        path: 'payment-methods/edit/:id',
        loadComponent: () =>
          import('./features/payment-methods/pages/payment-method-form/payment-method-form.component')
            .then(m => m.PaymentMethodFormComponent)
      },
      // Rota de calendário de eventos
      {
        path: 'calendar-events',
        loadComponent: () =>
          import('./features/calendar-events/calendar-events.component')
            .then(m => m.CalendarEventsComponent)
      },
      // Rotas de roles
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/roles/pages/role-list/role-list.component')
            .then(m => m.RoleListComponent)
      },
      {
        path: 'roles/new',
        loadComponent: () =>
          import('./features/roles/pages/role-form/role-form.component')
            .then(m => m.RoleFormComponent)
      },
      {
        path: 'roles/:id/edit',
        loadComponent: () =>
          import('./features/roles/pages/role-form/role-form.component')
            .then(m => m.RoleFormComponent)
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

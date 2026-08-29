import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

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
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/pages/product-list/product-list.component')
            .then(m => m.ProductListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Product.Get'] }
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/products/pages/product-form/product-form.component')
            .then(m => m.ProductFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Product.Create'] }
      },
      {
        path: 'products/edit/:id',
        loadComponent: () =>
          import('./features/products/pages/product-form/product-form.component')
            .then(m => m.ProductFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Product.Edit'] }
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/pages/client-list/client-list.component')
            .then(m => m.ClientListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Client.Get'] }
      },
      {
        path: 'clients/new',
        loadComponent: () =>
          import('./features/clients/pages/client-form/client-form.component')
            .then(m => m.ClientFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Client.Create'] }
      },
      {
        path: 'clients/edit/:id',
        loadComponent: () =>
          import('./features/clients/pages/client-form/client-form.component')
            .then(m => m.ClientFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Client.Edit'] }
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/pages/service-list/service-list.component')
            .then(m => m.ServiceListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Service.Get'] }
      },
      {
        path: 'services/new',
        loadComponent: () =>
          import('./features/services/pages/service-form/service-form.component')
            .then(m => m.ServiceFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Service.Create'] }
      },
      {
        path: 'services/edit/:id',
        loadComponent: () =>
          import('./features/services/pages/service-form/service-form.component')
            .then(m => m.ServiceFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Service.Edit'] }
      },
      {
        path: 'service-orders',
        loadComponent: () =>
          import('./features/service-orders/pages/service-order-list/service-order-list.component')
            .then(m => m.ServiceOrderListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['ServiceOrder.Get'] }
      },
      {
        path: 'service-orders/new',
        loadComponent: () =>
          import('./features/service-orders/pages/service-order-form/service-order-form.component')
            .then(m => m.ServiceOrderFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['ServiceOrder.Create'] }
      },
      {
        path: 'service-orders/edit/:id',
        loadComponent: () =>
          import('./features/service-orders/pages/service-order-form/service-order-form.component')
            .then(m => m.ServiceOrderFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['ServiceOrder.Edit'] }
      },
      {
        path: 'brands',
        loadComponent: () =>
          import('./features/brands/pages/brand-list/brand-list.component')
            .then(m => m.BrandListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Brand.Get'] }
      },
      {
        path: 'brands/new',
        loadComponent: () =>
          import('./features/brands/pages/brand-form/brand-form.component')
            .then(m => m.BrandFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Brand.Create'] }
      },
      {
        path: 'brands/:id/edit',
        loadComponent: () =>
          import('./features/brands/pages/brand-form/brand-form.component')
            .then(m => m.BrandFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Brand.Edit'] }
      },
      {
        path: 'cash-registers',
        loadComponent: () =>
          import('./features/cash-registers/pages/cash-register-list/cash-register-list.component')
            .then(m => m.CashRegisterListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['CashRegister.Get'] }
      },
      {
        path: 'cash-registers/new',
        loadComponent: () =>
          import('./features/cash-registers/pages/cash-register-form/cash-register-form.component')
            .then(m => m.CashRegisterFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['CashRegister.Create'] }
      },
      {
        path: 'cash-registers/:id/edit',
        loadComponent: () =>
          import('./features/cash-registers/pages/cash-register-form/cash-register-form.component')
            .then(m => m.CashRegisterFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['CashRegister.Edit'] }
      },
      {
        path: 'cash-registers/:cashRegisterId/cash-flows',
        loadComponent: () =>
          import('./features/cash-flows/pages/cash-flow-list/cash-flow-list.component')
            .then(m => m.CashFlowListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['CashFlow.Get'] }
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/pages/category-list/category-list.component')
            .then(m => m.CategoryListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Category.Get'] }
      },
      {
        path: 'categories/new',
        loadComponent: () =>
          import('./features/categories/pages/category-form/category-form.component')
            .then(m => m.CategoryFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Category.Create'] }
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () =>
          import('./features/categories/pages/category-form/category-form.component')
            .then(m => m.CategoryFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Category.Edit'] }
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/pages/user-list/user-list.component')
            .then(m => m.UserListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Identity.Get'] }
      },
      {
        path: 'users/new',
        loadComponent: () =>
          import('./features/users/pages/user-form/user-form.component')
            .then(m => m.UserFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Identity.Create'] }
      },
      {
        path: 'users/edit/:id',
        loadComponent: () =>
          import('./features/users/pages/user-form/user-form.component')
            .then(m => m.UserFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Identity.Edit'] }
      },
      {
        path: 'payment-methods',
        loadComponent: () =>
          import('./features/payment-methods/pages/payment-method-list/payment-method-list.component')
            .then(m => m.PaymentMethodListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['PaymentMethod.Get'] }
      },
      {
        path: 'payment-methods/new',
        loadComponent: () =>
          import('./features/payment-methods/pages/payment-method-form/payment-method-form.component')
            .then(m => m.PaymentMethodFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['PaymentMethod.Create'] }
      },
      {
        path: 'payment-methods/edit/:id',
        loadComponent: () =>
          import('./features/payment-methods/pages/payment-method-form/payment-method-form.component')
            .then(m => m.PaymentMethodFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['PaymentMethod.Edit'] }
      },
      {
        path: 'calendar-events',
        loadComponent: () =>
          import('./features/calendar-events/calendar-events.component')
            .then(m => m.CalendarEventsComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Event.Get'] }
      },
      {
        path: 'stock-movements',
        loadComponent: () =>
          import('./features/stock-movements/pages/stock-movement-list/stock-movement-list.component')
            .then(m => m.StockMovementListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['StockMovement.Get'] }
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/roles/pages/role-list/role-list.component')
            .then(m => m.RoleListComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Identity.Get'] }
      },
      {
        path: 'roles/new',
        loadComponent: () =>
          import('./features/roles/pages/role-form/role-form.component')
            .then(m => m.RoleFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Identity.Create'] }
      },
      {
        path: 'roles/:id/edit',
        loadComponent: () =>
          import('./features/roles/pages/role-form/role-form.component')
            .then(m => m.RoleFormComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Identity.Edit'] }
      },
      {
        path: 'commissions/settings',
        loadComponent: () =>
          import('./features/commissions/pages/commission-settings/commission-settings.component')
            .then(m => m.CommissionSettingsComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Commission.Get', 'Commission.Edit'] }
      },
      {
        path: 'commissions/apply',
        loadComponent: () =>
          import('./features/commissions/pages/commission-apply/commission-apply.component')
            .then(m => m.CommissionApplyComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Commission.Create'] }
      },
      {
        path: 'commissions/history',
        loadComponent: () =>
          import('./features/commissions/pages/commission-history/commission-history.component')
            .then(m => m.CommissionHistoryComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['Commission.Get'] }
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

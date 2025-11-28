import { Routes } from '@angular/router';
import { authGuard } from '../features/auth/guards/auth.guard';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard], // 👈 Protege TODO o layout
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('../features/products/products.routes').then(
            (m) => m.PRODUCTS_ROUTES
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

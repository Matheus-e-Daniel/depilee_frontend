import { Routes } from '@angular/router';
import { authGuard } from '../features/auth/guards/auth.guard';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      /*{
        path: 'dashboard',
        loadChildren: () =>
          import('../features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },*/
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

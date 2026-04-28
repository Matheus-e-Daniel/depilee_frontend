import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/user-form/user-form.component').then(m => m.UserFormComponent)
  }
];

export default [
  {
    path: 'users',
    canActivate: [authGuard],
    children: USER_ROUTES
  }
] satisfies Routes;

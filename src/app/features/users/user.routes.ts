import { Routes } from '@angular/router';
import { UserFormComponent } from './pages/user-form/user-form.component';
import { UserListComponent } from './pages/user-list/user-list.component';

export const USER_ROUTES: Routes = [
  { path: 'register', component: UserFormComponent },
  { path: 'users', component: UserListComponent },
];

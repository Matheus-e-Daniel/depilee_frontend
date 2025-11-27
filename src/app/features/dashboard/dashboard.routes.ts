// features/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '', // Isso vira /dashboard
    component: DashboardComponent
  },
  // Você pode adicionar sub-rotas aqui:
  // { path: 'settings', component: DashboardSettingsComponent }
];

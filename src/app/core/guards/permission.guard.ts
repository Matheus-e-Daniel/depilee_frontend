import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorModalService } from '../../shared/components/error-modal/error-modal.service';

export const permissionGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const errorModalService = inject(ErrorModalService);

  if (!authService.isAuthenticatedUser()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredPermissions = route.data['permissions'] as string[];

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  return authService.refreshPermissions().pipe(
    map(() => {
      const hasPermission = authService.hasAnyPermission(requiredPermissions);

      if (!hasPermission) {
        errorModalService.show('Você não tem permissão para acessar esta página.');
        router.navigate(['/dashboard']);
        return false;
      }

      return true;
    })
  );
};

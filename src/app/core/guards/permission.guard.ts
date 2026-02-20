// src/app/core/guards/permission.guard.ts
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermissions = route.data['permissions'] as string[];
  console.log(`🛡️ [Guard] Verificando acesso à rota:`, route.url);
  console.log(`🛡️ [Guard] Permissões necessárias:`, requiredPermissions);

  if (!requiredPermissions || requiredPermissions.length === 0) {
    console.log('🛡️ [Guard] Nenhuma permissão necessária - ✅ Acesso permitido');
    return true;
  }

  // Permissões já são carregadas automaticamente pelo AuthService

  console.log(`🛡️ [Guard] Permissões do usuário:`, authService.userPermissions());
  const hasPermission = authService.hasAnyPermission(requiredPermissions);

  if (!hasPermission) {
    console.warn('🛡️ [Guard] ❌ Acesso NEGADO. Redirecionando para dashboard...');
    router.navigate(['/dashboard']);
    return false;
  }

  console.log('🛡️ [Guard] ✅ Acesso PERMITIDO');
  return true;
};

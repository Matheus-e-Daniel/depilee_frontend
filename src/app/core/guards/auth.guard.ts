// src/app/core/guards/auth.guard.ts (SIMPLIFICADO)
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // SIMPLES: Verifica se está autenticado
  if (authService.isAuthenticatedUser()) {
    return true;
  } else {
    // Se não está autenticado, redireciona para login
    router.navigate(['/login']);
    return false;
  }
};

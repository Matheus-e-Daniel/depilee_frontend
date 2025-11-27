import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se há estado de autenticação no localStorage (opcional, para UX)
  const savedAuthState = localStorage.getItem('depilee_auth_state');

  if (savedAuthState) {
    const authState = JSON.parse(savedAuthState);
    if (authState.authenticated && new Date(authState.expires) > new Date()) {
      return true; // ✅ Acesso permitido baseado no estado local
    }
  }

  // Se não há estado local válido, valida com o backend
  return authService.validate().pipe(
    map((response) => {
      // ✅ Cookie válido - acesso permitido
      // Salva estado local para futuras verificações rápidas
      const authState = {
        authenticated: true,
        expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('depilee_auth_state', JSON.stringify(authState));

      return true;
    }),
    catchError((error) => {
      // ❌ Cookie inválido ou expirado
      localStorage.removeItem('depilee_auth_state');
      return of(router.parseUrl('/auth/login'));
    })
  );
};

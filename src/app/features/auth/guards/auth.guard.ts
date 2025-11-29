import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, catchError, of, tap } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ AuthGuard: Verificando acesso à rota protegida');

  // Verifica se há estado de autenticação no localStorage
  const savedAuthState = localStorage.getItem('depilee_auth_state');
  console.log('💾 Estado salvo no localStorage:', savedAuthState);

  if (savedAuthState) {
    const authState = JSON.parse(savedAuthState);
    const isExpired = new Date(authState.expires) <= new Date();

    console.log('📅 Estado local expirado?', isExpired);
    console.log('⏰ Expira em:', new Date(authState.expires));
    console.log('⏰ Agora:', new Date());

    if (authState.authenticated && !isExpired) {
      console.log('✅ AuthGuard: Acesso permitido via cache local');
      return true;
    } else {
      console.log('🔄 AuthGuard: Cache local expirado ou inválido');
      localStorage.removeItem('depilee_auth_state');
    }
  }

  console.log('🔍 AuthGuard: Validando com backend...');

  // Se não há estado local válido, valida com o backend
  return authService.validate().pipe(
    tap((response) => {
      console.log('✅ AuthGuard: Backend validou autenticação');
      console.log('📊 Response da validação:', response);
    }),
    map((response) => {
      // ✅ Cookie válido - acesso permitido
      const authState = {
        authenticated: true,
        expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('depilee_auth_state', JSON.stringify(authState));

      console.log('💾 Novo estado salvo no localStorage:', authState);
      return true;
    }),
    catchError((error) => {
      // ❌ Cookie inválido ou expirado
      console.error('❌ AuthGuard: Validação falhou', error);
      console.log('📊 Detalhes do erro:', {
        status: error.status,
        error: error.error
      });

      localStorage.removeItem('depilee_auth_state');
      console.log('🧹 LocalStorage limpo devido a erro de validação');

      console.log('🔀 Redirecionando para /auth/login');
      return of(router.parseUrl('/auth/login'));
    })
  );
};

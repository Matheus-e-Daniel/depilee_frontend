import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  console.log('🔗 AuthInterceptor: Interceptando request');
  console.log('📤 Request:', {
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  // Clona a requisição para adicionar withCredentials
  const authReq = req.clone({
    withCredentials: true
  });

  console.log('🍪 WithCredentials: true');

  return next(authReq).pipe(
    tap({
      next: (response: any) => {
        console.log('✅ AuthInterceptor: Response recebido');
        console.log('📊 Response:', {
          status: response.status,
          url: response.url,
          headers: response.headers
        });
      },
      error: (error) => {
        console.error('❌ AuthInterceptor: Erro na requisição');
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.log('🚨 AuthInterceptor: Tratando erro...');

      if (error.status === 401) {
        console.warn('🔐 AuthInterceptor: Erro 401 - Não autorizado');
        console.log('📊 Detalhes do erro 401:', {
          url: error.url,
          statusText: error.statusText,
          error: error.error
        });

        // Token/cookie expirado ou inválido
        localStorage.removeItem('depilee_auth_state');
        console.log('🧹 LocalStorage limpo devido a erro 401');

        console.log('🔀 Redirecionando para /auth/login');
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        console.warn('🚫 AuthInterceptor: Erro 403 - Proibido');
      } else if (error.status === 404) {
        console.warn('🔍 AuthInterceptor: Erro 404 - Não encontrado');
      } else if (error.status >= 500) {
        console.error('🔥 AuthInterceptor: Erro do servidor', error.status);
      }

      return throwError(() => error);
    })
  );
};

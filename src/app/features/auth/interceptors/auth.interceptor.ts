import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Clona a requisição para adicionar withCredentials em todas as chamadas API
  const authReq = req.clone({
    withCredentials: true // 👈 Garante que cookies são enviados em TODAS as requisições
  });

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token/cookie expirado ou inválido
        localStorage.removeItem('depilee_auth_state');
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};

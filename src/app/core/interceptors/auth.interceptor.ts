// src/app/core/interceptors/auth.interceptor.ts (SIMPLIFICADO)
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Não interceptar chamadas para APIs externas (como ViaCEP)
  const isExternalApi = !req.url.includes('localhost') &&
                        !req.url.includes('127.0.0.1') &&
                        !req.url.includes('depilee') &&
                        req.url.includes('http');

  // Se for API externa, passa a requisição sem modificar
  if (isExternalApi) {
    console.log('🌐 Requisição externa detectada, não interceptando:', req.url);
    return next(req);
  }

  // SIMPLES: Só adiciona withCredentials para requisições internas
  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Se der 401, marca como não autenticado
        authService.setAuthenticated(false);
        // Redireciona apenas se não estiver na página de login
        if (!router.url.includes('/login')) {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorModalService } from '../../shared/components/error-modal/error-modal.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const errorModalService = inject(ErrorModalService);

  const isExternalApi = !req.url.includes('localhost') &&
                        !req.url.includes('127.0.0.1') &&
                        !req.url.includes('depilee') &&
                        req.url.includes('http');

  if (isExternalApi) {
    return next(req);
  }

  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401/403 disparados pelo gate de autenticação/autorização do backend vêm com corpo vazio
      // (0 bytes) — diferente do 401 de credenciais inválidas do /login, que tem { data, message }
      // e é tratado pelo próprio login.component.
      if (error.status === 401 && !router.url.includes('/login')) {
        authService.setAuthenticated(false);
        errorModalService.show('Sessão expirada. Faça login novamente.');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        errorModalService.show('Você não tem permissão para realizar esta ação.');
      }
      return throwError(() => error);
    })
  );
};

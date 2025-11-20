import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.getToken();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    (source) =>
      new Observable((observer) => {
        return source.subscribe({
          next: (event) => observer.next(event),
          error: (err) => {
            if (err.status === 401) {
              tokenService.clearToken();
              router.navigate(['/auth/login']);
            }
            observer.error(err);
          },
          complete: () => observer.complete(),
        });
      })
  );
};

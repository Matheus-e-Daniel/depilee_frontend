import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, timeout } from 'rxjs';

const REQUEST_TIMEOUT_MS = 15000;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((error: HttpErrorResponse | Error) => {
      if (error.name === 'TimeoutError') {
        return throwError(() => new HttpErrorResponse({
          error: { message: 'Tempo de resposta excedido. Tente novamente.' },
          status: 0,
          url: req.url
        }));
      }
      return throwError(() => error);
    })
  );
};

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'O recurso solicitado não foi encontrado.',
  409: 'Conflito ao processar a requisição.',
  422: 'Dados inválidos. Verifique as informações enviadas.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Serviço indisponível. Tente novamente em instantes.',
  503: 'Serviço temporariamente indisponível.',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 is handled by authInterceptor — skip here
      if (error.status === 401) {
        return throwError(() => error);
      }

      const detail =
        HTTP_ERROR_MESSAGES[error.status] ??
        'Ocorreu um erro inesperado. Tente novamente.';

      messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail,
        life: 5000,
      });

      return throwError(() => error);
    })
  );
};

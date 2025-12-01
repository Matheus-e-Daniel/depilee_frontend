// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      'http://localhost:5093/v1/identity/login',
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          console.log('Login bem-sucedido');
        }
      })
    );
  }

  // src/app/core/services/auth.service.ts (atualização do método logout)
logout(): void {
  this.http.post('http://localhost:5093/v1/identity/logout', {}, {
    withCredentials: true
  }).subscribe({
    next: () => {
      // Limpar qualquer estado local se necessário
      this.router.navigate(['/login']);
    },
    error: () => {
      // Mesmo em caso de erro, redireciona para login
      this.router.navigate(['/login']);
    }
  });
}

  isAuthenticated(): Observable<boolean> {
    return this.http.get<boolean>('http://localhost:5093/v1/identity/check-auth', {
      withCredentials: true
    });
  }
}

import { environment } from '../../../environments/environment';
// src/app/core/services/auth.service.ts (SIMPLIFICADO)
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

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
  private readonly AUTH_KEY = 'isAuthenticated';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔄 Enviando login:', credentials.email);

    return this.http.post<LoginResponse>(
      environment.apiBaseUrl + 'identity/login',
      credentials,
      { withCredentials: true }
    );
  }

  logout(): void {
    this.http.post(environment.apiBaseUrl + 'identity/logout', {}, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.setAuthenticated(false);
        this.router.navigate(['/login']);
      },
      error: () => {
        this.setAuthenticated(false);
        this.router.navigate(['/login']);
      }
    });
  }

  // Método SIMPLES - verifica localStorage
  isAuthenticatedUser(): boolean {
    return localStorage.getItem(this.AUTH_KEY) === 'true';
  }

  // Método para setar estado após login bem-sucedido
  setAuthenticated(value: boolean): void {
    if (value) {
      localStorage.setItem(this.AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(this.AUTH_KEY);
    }
  }
}

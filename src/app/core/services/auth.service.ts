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

  // Variável SIMPLES para controlar estado local
  private isAuthenticated = false;

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔄 Enviando login:', credentials.email);

    return this.http.post<LoginResponse>(
      'http://localhost:5093/v1/identity/login',
      credentials,
      { withCredentials: true }
    );
  }

  logout(): void {
    this.http.post('http://localhost:5093/v1/identity/logout', {}, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.isAuthenticated = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isAuthenticated = false;
        this.router.navigate(['/login']);
      }
    });
  }

  // Método SIMPLES - sempre retorna true se houve login bem-sucedido
  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  // Método para setar estado após login bem-sucedido
  setAuthenticated(value: boolean): void {
    this.isAuthenticated = value;
  }
}

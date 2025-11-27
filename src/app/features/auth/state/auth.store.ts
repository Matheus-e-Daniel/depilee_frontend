import { Injectable, signal, effect } from '@angular/core';
import { AuthService } from '../services/auth.service';

export interface AuthState {
  authenticated: boolean;
  loading: boolean;
  user: any | null;
  lastValidation: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  state = signal<AuthState>({
    authenticated: false,
    loading: false,
    user: null,
    lastValidation: null
  });

  constructor(private authService: AuthService) {
    // Efeito para persistir estado no localStorage
    effect(() => {
      const currentState = this.state();
      if (currentState.authenticated) {
        const authState = {
          authenticated: true,
          expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('depilee_auth_state', JSON.stringify(authState));
      } else {
        localStorage.removeItem('depilee_auth_state');
      }
    });

    // Tenta recuperar estado do localStorage ao inicializar
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    const saved = localStorage.getItem('depilee_auth_state');
    if (saved) {
      const authState = JSON.parse(saved);
      if (new Date(authState.expires) > new Date()) {
        this.setAuthenticated(true);
        // Opcional: validar com backend em segundo plano
        this.validateWithBackend();
      } else {
        localStorage.removeItem('depilee_auth_state');
      }
    }
  }

  private validateWithBackend() {
    this.authService.validate().subscribe({
      next: (user) => {
        this.setUser(user);
        this.setAuthenticated(true);
      },
      error: () => {
        this.setAuthenticated(false);
        this.setUser(null);
        localStorage.removeItem('depilee_auth_state');
      }
    });
  }

  setAuthenticated(value: boolean) {
    this.state.update((s) => ({ ...s, authenticated: value }));
  }

  setLoading(value: boolean) {
    this.state.update((s) => ({ ...s, loading: value }));
  }

  setUser(user: any | null) {
    this.state.update((s) => ({ ...s, user }));
  }

  setLastValidation(timestamp: string) {
    this.state.update((s) => ({ ...s, lastValidation: timestamp }));
  }

  get authenticated() {
    return this.state().authenticated;
  }

  get user() {
    return this.state().user;
  }

  get loading() {
    return this.state().loading;
  }

  // Método para logout completo
  async logout() {
    this.setLoading(true);
    try {
      await this.authService.logout().toPromise();
    } catch (error) {
      console.warn('Erro durante logout:', error);
    } finally {
      this.setAuthenticated(false);
      this.setUser(null);
      this.setLoading(false);
      localStorage.removeItem('depilee_auth_state');
    }
  }
}

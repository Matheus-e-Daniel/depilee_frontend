import { Injectable, signal } from '@angular/core';
import { TokenService } from '../services/token.service';

export interface AuthState {
  authenticated: boolean;
  loading: boolean;
  user: any | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private tokenService = new TokenService();

  state = signal<AuthState>({
    authenticated: !!this.tokenService.getToken() && !this.tokenService.isTokenExpired(),
    loading: false,
    user: this.tokenService.decode(),
  });

  setAuthenticated(value: boolean) {
    this.state.update((s) => ({ ...s, authenticated: value }));
  }

  setLoading(value: boolean) {
    this.state.update((s) => ({ ...s, loading: value }));
  }

  setUser(user: any | null) {
    this.state.update((s) => ({ ...s, user }));
  }

  get authenticated() {
    return this.state().authenticated;
  }

  get user() {
    return this.state().user;
  }
}

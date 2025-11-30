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
    console.log('🏪 AuthStore: Inicializado');
    console.log('📊 Estado inicial:', this.state());

    // Efeito para persistir estado no localStorage
    effect(() => {
      const currentState = this.state();
      console.log('🔄 AuthStore: Effect disparado - Estado atual:', currentState);

      if (currentState.authenticated) {
        const authState = {
          authenticated: true,
          expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('depilee_auth_state', JSON.stringify(authState));
        console.log('💾 AuthStore: Estado salvo no localStorage:', authState);
      } else {
        localStorage.removeItem('depilee_auth_state');
        console.log('🧹 AuthStore: Estado removido do localStorage');
      }
    });

    // Tenta recuperar estado do localStorage ao inicializar
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    console.log('🔍 AuthStore: Inicializando a partir do localStorage...');
    const saved = localStorage.getItem('depilee_auth_state');

    if (saved) {
      console.log('📂 AuthStore: Estado encontrado no localStorage:', saved);
      const authState = JSON.parse(saved);
      const isExpired = new Date(authState.expires) <= new Date();

      console.log('📅 Estado expirado?', isExpired);
      console.log('⏰ Expira em:', new Date(authState.expires));
      console.log('⏰ Agora:', new Date());

      if (!isExpired) {
        console.log('✅ AuthStore: Restaurando estado do localStorage');
        this.setAuthenticated(true);
        this.validateWithBackend();
      } else {
        console.log('🔄 AuthStore: Estado expirado, removendo...');
        localStorage.removeItem('depilee_auth_state');
      }
    } else {
      console.log('📭 AuthStore: Nenhum estado encontrado no localStorage');
    }
  }

  private validateWithBackend() {
    console.log('🔐 AuthStore: Validando estado com backend...');

    this.authService.validate().subscribe({
      next: (user) => {
        console.log('✅ AuthStore: Backend validou estado');
        console.log('👤 Dados do usuário recebidos:', user);

        this.setUser(user);
        this.setAuthenticated(true);
        console.log('📊 AuthStore após validação:', this.state());
      },
      error: (error) => {
        console.error('❌ AuthStore: Validação com backend falhou', error);
        this.setAuthenticated(false);
        this.setUser(null);
        localStorage.removeItem('depilee_auth_state');
        console.log('📊 AuthStore após erro:', this.state());
      }
    });
  }

  setAuthenticated(value: boolean) {
    console.log('🔄 AuthStore: setAuthenticated(', value, ')');
    const oldState = this.state();
    this.state.update((s) => ({ ...s, authenticated: value }));
    console.log('📊 Estado anterior:', oldState);
    console.log('📊 Estado atual:', this.state());
  }

  setLoading(value: boolean) {
    console.log('🔄 AuthStore: setLoading(', value, ')');
    this.state.update((s) => ({ ...s, loading: value }));
  }

  setUser(user: any | null) {
    console.log('🔄 AuthStore: setUser(', user, ')');
    this.state.update((s) => ({ ...s, user }));
  }

  setLastValidation(timestamp: string) {
    console.log('🔄 AuthStore: setLastValidation(', timestamp, ')');
    this.state.update((s) => ({ ...s, lastValidation: timestamp }));
  }

  get authenticated() {
    const auth = this.state().authenticated;
    console.log('🔍 AuthStore: get authenticated ->', auth);
    return auth;
  }

  get user() {
    const user = this.state().user;
    console.log('🔍 AuthStore: get user ->', user);
    return user;
  }

  get loading() {
    const loading = this.state().loading;
    console.log('🔍 AuthStore: get loading ->', loading);
    return loading;
  }

  // Método para logout completo
  async logout() {
    console.log('🚪 AuthStore: Iniciando logout...');
    this.setLoading(true);

    try {
      console.log('📤 AuthStore: Enviando logout para backend...');
      await this.authService.logout().toPromise();
      console.log('✅ AuthStore: Logout do backend bem-sucedido');
    } catch (error) {
      console.warn('⚠️ AuthStore: Erro durante logout:', error);
    } finally {
      console.log('🧹 AuthStore: Limpando estado local...');
      this.setAuthenticated(false);
      this.setUser(null);
      this.setLoading(false);
      localStorage.removeItem('depilee_auth_state');
      console.log('📊 AuthStore após logout:', this.state());
    }
  }
}

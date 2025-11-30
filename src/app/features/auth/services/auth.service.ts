import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5093/v1/identity';

  constructor(private http: HttpClient) {
    console.log('🔧 AuthService: Inicializado');
    console.log('🌐 API URL:', this.apiUrl);
  }

  login(email: string, password: string): Observable<any> {
    console.log('🚀 AuthService.login() chamado');
    console.log('📤 Enviando para API:', {
      email,
      passwordLength: password?.length,
      endpoint: `${this.apiUrl}/login`
    });

    const requestBody = { email, password };
    console.log('📦 Request body:', requestBody);

    return this.http.post(
      `${this.apiUrl}/login`,
      requestBody,
      {
        withCredentials: true,
        observe: 'response' // Para ver headers e status completo
      }
    ).pipe(
      tap({
        next: (response: any) => {
          console.log('✅ AuthService: Response recebido do login');
          console.log('📊 Status:', response.status);
          console.log('📦 Headers:', response.headers);
          console.log('📨 Body:', response.body);
          console.log('🍪 Cookies enviados?', true); // withCredentials garante
        },
        error: (error) => {
          console.error('❌ AuthService: Erro no login');
          console.log('📊 Error details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            url: error.url,
            headers: error.headers
          });
        },
        complete: () => {
          console.log('🏁 AuthService: Request de login completo');
        }
      })
    );
  }

  logout(): Observable<any> {
    console.log('🚪 AuthService: Logout chamado');

    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      {
        withCredentials: true,
        observe: 'response'
      }
    ).pipe(
      tap({
        next: (response) => {
          console.log('✅ AuthService: Logout bem-sucedido');
          console.log('📊 Response:', response);
          localStorage.removeItem('depilee_auth_state');
          console.log('🧹 LocalStorage limpo');
        },
        error: (error) => {
          console.error('❌ AuthService: Erro no logout', error);
        }
      })
    );
  }

  validate(): Observable<any> {
    console.log('🔍 AuthService: Validando autenticação');
    console.log('📤 Enviando request para:', `${this.apiUrl}/validate`);

    return this.http.get(
      `${this.apiUrl}/validate`,
      {
        withCredentials: true,
        observe: 'response'
      }
    ).pipe(
      tap({
        next: (response) => {
          console.log('✅ AuthService: Validação bem-sucedida');
          console.log('📊 Status:', response.status);
          console.log('👤 User data:', response.body);
        },
        error: (error) => {
          console.error('❌ AuthService: Validação falhou');
          console.log('📊 Error:', {
            status: error.status,
            error: error.error
          });
        }
      })
    );
  }

  getProfile(): Observable<any> {
    console.log('👤 AuthService: Obtendo perfil do usuário');

    return this.http.get(
      `${this.apiUrl}/profile`,
      {
        withCredentials: true,
        observe: 'response'
      }
    ).pipe(
      tap({
        next: (response) => {
          console.log('✅ AuthService: Perfil obtido com sucesso');
          console.log('📊 Response:', response.body);
        },
        error: (error) => {
          console.error('❌ AuthService: Erro ao obter perfil', error);
        }
      })
    );
  }
}

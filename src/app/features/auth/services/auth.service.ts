import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://2bc7ccc15511.ngrok-free.app/v1/identity/login';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true } // 👈 Cookies são enviados/recibidos automaticamente
    );
  }

  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Limpa o estado local após logout
        localStorage.removeItem('depilee_auth_state');
      })
    );
  }

  validate(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/validate`,
      { withCredentials: true }
    );
  }

  getProfile(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/profile`,
      { withCredentials: true }
    );
  }
}

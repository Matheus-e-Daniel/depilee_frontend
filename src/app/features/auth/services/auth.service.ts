import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        if (res?.token) this.tokenService.saveToken(res.token);
      })
    );
  }

  logout() {
    this.tokenService.clearToken();
  }

  /*-
  getProfile() {
    return this.http.get(`${this.apiUrl}/profile`);
  }
  */
}

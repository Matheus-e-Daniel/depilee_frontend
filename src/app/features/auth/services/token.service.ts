import { Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode';
import { JwtPayload } from '../utils/jwt.util';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private key = 'depilee_token';

  saveToken(token: string) {
    localStorage.setItem(this.key, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.key);
  }

  clearToken() {
    localStorage.removeItem(this.key);
  }

  isTokenExpired(token?: string): boolean {
    const t = token ?? this.getToken();
    if (!t) return true;
    try {
      const decoded = jwtDecode<JwtPayload>(t);
      if (!decoded?.exp) return false;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  decode<T = any>(token?: string): T | null {
    const t = token ?? this.getToken();
    if (!t) return null;
    try {
      return jwtDecode<T>(t);
    } catch {
      return null;
    }
  }
}

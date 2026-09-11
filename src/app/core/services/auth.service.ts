import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError, of } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface UserData {
  id: number;
  userName: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
}

export interface LoginResponse {
  data: UserData;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly AUTH_KEY = 'isAuthenticated';
  private readonly USER_KEY = 'userData';

  private _permissions: Permission[] = [];
  private _user: UserData | null = null;

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      environment.apiBaseUrl + 'identity/login',
      credentials,
      { withCredentials: true }
    );
  }

  setUserData(user: UserData): void {
    this._user = user;
    this._permissions = user.permissions || [];
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUserData(): UserData | null {
    if (this._user) return this._user;
    const stored = localStorage.getItem(this.USER_KEY);
    if (stored) {
      try {
        this._user = JSON.parse(stored);
        this._permissions = this._user?.permissions ?? [];
      } catch {
        localStorage.removeItem(this.USER_KEY);
      }
      return this._user;
    }
    return null;
  }

  getPermissions(): Permission[] {
    this.getUserData();
    return this._permissions;
  }

  /**
   * Refetches the current user's permissions from the backend so the
   * client-side cache reflects any change made server-side (e.g. a role's
   * permissions were revoked) without requiring a new login.
   */
  refreshPermissions(): Observable<Permission[]> {
    return this.http.get<{ data: string[] }>(
      environment.apiBaseUrl + 'identity/users/me/permissions',
      { withCredentials: true }
    ).pipe(
      map(response => {
        const permissionNames = response.data || [];
        const permissions = permissionNames.map(name => ({ id: 0, name }));

        this.getUserData();
        this._permissions = permissions;
        if (this._user) {
          this._user = { ...this._user, permissions };
          localStorage.setItem(this.USER_KEY, JSON.stringify(this._user));
        }

        return permissions;
      }),
      catchError(() => of(this._permissions))
    );
  }

  userPermissions(): string[] {
    return this.getPermissions().map((p: Permission) => p.name);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPerms = this.userPermissions();
    return permissions.some(p => userPerms.includes(p));
  }

  hasAllPermissions(permissions: string[]): boolean {
    const userPerms = this.userPermissions();
    return permissions.every(p => userPerms.includes(p));
  }

  logout(): void {
    this.http.post(environment.apiBaseUrl + 'identity/logout', {}, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.setAuthenticated(false);
        localStorage.removeItem(this.USER_KEY);
        this._user = null;
        this._permissions = [];
        this.router.navigate(['/login']);
      },
      error: () => {
        this.setAuthenticated(false);
        localStorage.removeItem(this.USER_KEY);
        this._user = null;
        this._permissions = [];
        this.router.navigate(['/login']);
      }
    });
  }

  isAuthenticatedUser(): boolean {
    return localStorage.getItem(this.AUTH_KEY) === 'true';
  }

  setAuthenticated(value: boolean): void {
    if (value) {
      localStorage.setItem(this.AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(this.AUTH_KEY);
    }
  }
}

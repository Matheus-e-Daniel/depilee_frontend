import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'identity/register';
  private apiListUrl = environment.apiBaseUrl + 'identity/users/all';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiListUrl);
  }

    getById(id: string): Observable<User> {
      return this.http.get<User>(`${environment.apiBaseUrl}identity/users/${id}`);
    }

  create(user: any): Observable<User> {
    console.log('[UserService][create] Enviando:', user);
    return this.http.post<User>(this.apiUrl, user);
  }

  update(user: any): Observable<User> {
    console.log('[UserService][update] Enviando:', user);
    return this.http.put<User>(this.apiUrl, user);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignRole(userId: string | number, roleName: string): Observable<any> {
    console.log(`[UserService][assignRole] Atribuindo role "${roleName}" ao usuário ${userId}`);
    return this.http.post(`${environment.apiBaseUrl}identity/user/${userId}/role`, { roleName });
  }
}

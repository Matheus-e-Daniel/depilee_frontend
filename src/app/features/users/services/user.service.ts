import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { User, UserFormData } from '../models/user.model';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

const EMPTY_USERS_RESPONSE: ApiResponse<User[]> = { data: [], message: '' };

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'identity';
  private apiListUrl = environment.apiBaseUrl + 'identity/users/all';

  getAll(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.apiListUrl).pipe(
      catchError((err: HttpErrorResponse) => err.status === 404 ? of(EMPTY_USERS_RESPONSE) : throwError(() => err))
    );
  }

  getById(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${id}`);
  }

  create(user: UserFormData): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/register`, user);
  }

  update(user: UserFormData & { id: number }): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${user.id}`, user);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/users/${id}`);
  }

  assignRole(userId: string | number, roleName: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/user/${userId}/role`, { roleName });
  }
}

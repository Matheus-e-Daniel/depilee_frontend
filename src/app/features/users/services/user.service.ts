import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { User, UserFormData } from '../models/user.model';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

const EMPTY_PAGED_RESPONSE: PagedApiResponse<any> = {
  data: [],
  message: '',
  currentPage: 1,
  pageSize: 0,
  totalCount: 0,
  totalPages: 0
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'identity/register';
  private apiListUrl = environment.apiBaseUrl + 'identity/users/all';

  getAll(): Observable<PagedApiResponse<User>> {
    return this.http.get<PagedApiResponse<User>>(this.apiListUrl).pipe(
      catchError((err: HttpErrorResponse) => err.status === 404 ? of(EMPTY_PAGED_RESPONSE) : throwError(() => err))
    );
  }

    getById(id: string): Observable<ApiResponse<User>> {
      return this.http.get<ApiResponse<User>>(`${environment.apiBaseUrl}identity/users/${id}`);
    }

  create(user: UserFormData): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, user);
  }

  update(user: UserFormData & { id: string }): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(this.apiUrl, user);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  assignRole(userId: string | number, roleName: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiBaseUrl}identity/user/${userId}/role`, { roleName });
  }
}

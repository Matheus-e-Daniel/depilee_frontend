import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role, RoleFormData, Permission, RolePermissions } from '../models/role.model';
import { ApiResponse } from '../../../core/models/api-response.model';

const emptyOn404 = <T>(err: HttpErrorResponse, fallback: T) =>
  err.status === 404 ? of({ data: fallback, message: '' } as ApiResponse<T>) : throwError(() => err);

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'identity/roles';
  private permissionsUrl = environment.apiBaseUrl + 'identity/permissions';

  getAll(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/all`).pipe(
      catchError((err: HttpErrorResponse) => emptyOn404(err, [] as Role[])),
      map(response => response.data || [])
    );
  }

  getById(id: string | number): Observable<Role> {
    return this.http.get<ApiResponse<Role>>(`${this.permissionsUrl}/role/${id}`).pipe(
      catchError((err: HttpErrorResponse) => emptyOn404(err, {} as Role)),
      map(response => response.data || ({} as Role))
    );
  }

  getRolePermissionsById(id: string | number): Observable<Permission[]> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.permissionsUrl}/role/${id}`).pipe(
      catchError((err: HttpErrorResponse) => emptyOn404(err, [] as Permission[])),
      map(response => response.data || [])
    );
  }

  create(role: RoleFormData): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.apiUrl, role);
  }

  update(role: RoleFormData & { id: number }): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(this.apiUrl, role);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<ApiResponse<Permission[]>>(this.permissionsUrl).pipe(
      catchError((err: HttpErrorResponse) => emptyOn404(err, [] as Permission[])),
      map(response => response.data || [])
    );
  }

  assignPermissions(rolePermissions: RolePermissions): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/permissions`, rolePermissions);
  }
}

import { environment } from '../../../../environments/environment';
// src/app/features/roles/services/role.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PagedResponse, Role, RoleFormData, Permission, RolePermissions } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'identity/roles';
  private permissionsUrl = environment.apiBaseUrl + 'identity/permissions';

  getAll(): Observable<Role[]> {
    return this.http.get<any>(`${this.apiUrl}/all`).pipe(
      map(response => response.data || [])
    );
  }

  getById(id: string | number): Observable<Role> {
    return this.http.get<any>(`${this.permissionsUrl}/role/${id}`).pipe(
      map(response => response.data || {})
    );
  }

  getRolePermissionsById(id: string | number): Observable<Permission[]> {
    return this.http.get<any>(`${this.permissionsUrl}/role/${id}`).pipe(
      map(response => response.data || [])
    );
  }

  create(role: RoleFormData): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  update(role: any): Observable<Role> {
    return this.http.put<Role>(this.apiUrl, role);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Permissions
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<any>(this.permissionsUrl).pipe(
      map(response => response.data || [])
    );
  }

  assignPermissions(rolePermissions: RolePermissions): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/permissions`, rolePermissions);
  }
}

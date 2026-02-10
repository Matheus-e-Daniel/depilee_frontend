import { environment } from '../../../../environments/environment';
// src/app/features/roles/services/role.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse, Role, RoleFormData, Permission, RolePermissions } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'identity/roles';
  private permissionsUrl = environment.apiBaseUrl + 'identity/permissions';

  getAll(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/all`);
  }

  getById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
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
    return this.http.get<Permission[]>(this.permissionsUrl);
  }

  assignPermissions(rolePermissions: RolePermissions): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/permissions`, rolePermissions);
  }
}

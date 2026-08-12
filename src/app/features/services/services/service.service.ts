import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Service, ServiceFormData, ServiceCategory } from '../models/service.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'services';

  getAll(): Observable<PagedApiResponse<Service>> {
    return this.http.get<PagedApiResponse<Service>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Service>> {
    return this.http.get<ApiResponse<Service>>(`${this.apiUrl}/${id}`);
  }

  create(service: ServiceFormData): Observable<ApiResponse<Service>> {
    return this.http.post<ApiResponse<Service>>(this.apiUrl, service);
  }

  update(service: any): Observable<ApiResponse<Service>> {
    return this.http.put<ApiResponse<Service>>(this.apiUrl, service);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<PagedApiResponse<ServiceCategory>> {
    return this.http.get<PagedApiResponse<ServiceCategory>>(environment.apiBaseUrl + 'service-categories');
  }
}

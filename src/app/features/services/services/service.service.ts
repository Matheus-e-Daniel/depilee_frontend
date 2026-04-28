import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Service, ServiceFormData, ServiceCategory } from '../models/service.model';
import { PagedResponse } from '../../products/product.index';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'services';

  getAll(): Observable<PagedResponse<Service>> {
    return this.http.get<PagedResponse<Service>>(this.apiUrl);
  }

  getById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  create(service: ServiceFormData): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service);
  }

  update(service: any): Observable<Service> {
    return this.http.put<Service>(this.apiUrl, service);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(environment.apiBaseUrl + 'service-categories');
  }
}

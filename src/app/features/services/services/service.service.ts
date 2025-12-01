// src/app/features/services/services/service.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service, ServiceFormData, ServiceCategory } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5093/v1/services';

  getAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }

  getById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  create(service: ServiceFormData): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service);
  }

  update(id: string, service: ServiceFormData): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>('http://localhost:5093/v1/service-categories');
  }
}

// src/app/features/service-order-items/services/service-order-item.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceOrderItem, ServiceOrderItemFormData, ServiceOrder, ProductOption, ServiceOption } from '../models/service-order-item.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderItemService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5093/v1/service-order-items';

  getAll(): Observable<ServiceOrderItem[]> {
    return this.http.get<ServiceOrderItem[]>(this.apiUrl);
  }

  getByServiceOrderId(serviceOrderId: string): Observable<ServiceOrderItem[]> {
    return this.http.get<ServiceOrderItem[]>(`${this.apiUrl}/service-order/${serviceOrderId}`);
  }

  getById(id: string): Observable<ServiceOrderItem> {
    return this.http.get<ServiceOrderItem>(`${this.apiUrl}/${id}`);
  }

  create(item: ServiceOrderItemFormData): Observable<ServiceOrderItem> {
    return this.http.post<ServiceOrderItem>(this.apiUrl, item);
  }

  update(id: string, item: ServiceOrderItemFormData): Observable<ServiceOrderItem> {
    return this.http.put<ServiceOrderItem>(`${this.apiUrl}/${id}`, item);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Métodos auxiliares para dropdowns
  getServiceOrders(): Observable<ServiceOrder[]> {
    return this.http.get<ServiceOrder[]>('http://localhost:5093/v1/service-orders');
  }

  getProducts(): Observable<ProductOption[]> {
    return this.http.get<ProductOption[]>('http://localhost:5093/v1/products');
  }

  getServices(): Observable<ServiceOption[]> {
    return this.http.get<ServiceOption[]>('http://localhost:5093/v1/services');
  }
}

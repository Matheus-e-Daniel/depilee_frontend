import { environment } from '../../../../environments/environment';
// src/app/features/service-order-items/services/service-order-item.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceOrderItem, ServiceOrderItemFormData, PagedResponse, ServiceOrder, ProductOption, ServiceOption } from '../models/service-order-item.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderItemService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'service-order-items';

  getAll(): Observable<PagedResponse<ServiceOrderItem>> {
    return this.http.get<PagedResponse<ServiceOrderItem>>(this.apiUrl);
  }

  getById(id: number): Observable<ServiceOrderItem> {
    return this.http.get<ServiceOrderItem>(`${this.apiUrl}/${id}`);
  }

  create(item: ServiceOrderItemFormData): Observable<ServiceOrderItem> {
    return this.http.post<ServiceOrderItem>(this.apiUrl, item);
  }

  update(item: any): Observable<ServiceOrderItem> {
    return this.http.put<ServiceOrderItem>(this.apiUrl, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getServiceOrders(): Observable<PagedResponse<ServiceOrder>> {
    return this.http.get<PagedResponse<ServiceOrder>>(environment.apiBaseUrl + 'service-orders');
  }

  getProducts(): Observable<PagedResponse<ProductOption>> {
    return this.http.get<PagedResponse<ProductOption>>(environment.apiBaseUrl + 'products');
  }

  getServices(): Observable<PagedResponse<ServiceOption>> {
    return this.http.get<PagedResponse<ServiceOption>>(environment.apiBaseUrl + 'services');
  }
}

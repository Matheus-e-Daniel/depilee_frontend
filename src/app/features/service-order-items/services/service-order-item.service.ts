import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceOrderItem, ServiceOrderItemFormData, ServiceOrder, ProductOption, ServiceOption } from '../models/service-order-item.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderItemService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'service-order-items';

  getAll(): Observable<PagedApiResponse<ServiceOrderItem>> {
    return this.http.get<PagedApiResponse<ServiceOrderItem>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<ServiceOrderItem>> {
    return this.http.get<ApiResponse<ServiceOrderItem>>(`${this.apiUrl}/${id}`);
  }

  create(item: ServiceOrderItemFormData): Observable<ApiResponse<ServiceOrderItem>> {
    return this.http.post<ApiResponse<ServiceOrderItem>>(this.apiUrl, item);
  }

  update(item: any): Observable<ApiResponse<ServiceOrderItem>> {
    return this.http.put<ApiResponse<ServiceOrderItem>>(this.apiUrl, item);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getServiceOrders(): Observable<PagedApiResponse<ServiceOrder>> {
    return this.http.get<PagedApiResponse<ServiceOrder>>(environment.apiBaseUrl + 'service-orders');
  }

  getProducts(): Observable<PagedApiResponse<ProductOption>> {
    return this.http.get<PagedApiResponse<ProductOption>>(environment.apiBaseUrl + 'products');
  }

  getServices(): Observable<PagedApiResponse<ServiceOption>> {
    return this.http.get<PagedApiResponse<ServiceOption>>(environment.apiBaseUrl + 'services');
  }
}

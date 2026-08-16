import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceOrderItem, ServiceOrderItemFormData, ProductOption, ServiceOption } from '../models/service-order-item.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderItemService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'service-order-items';

  getAll(serviceOrderId: number): Observable<PagedApiResponse<ServiceOrderItem>> {
    const params = new HttpParams().set('serviceOrderId', serviceOrderId);
    return this.http.get<PagedApiResponse<ServiceOrderItem>>(this.apiUrl, { params });
  }

  create(item: ServiceOrderItemFormData): Observable<ApiResponse<ServiceOrderItem>> {
    return this.http.post<ApiResponse<ServiceOrderItem>>(this.apiUrl, item);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getProducts(): Observable<PagedApiResponse<ProductOption>> {
    return this.http.get<PagedApiResponse<ProductOption>>(environment.apiBaseUrl + 'products');
  }

  getServices(): Observable<PagedApiResponse<ServiceOption>> {
    return this.http.get<PagedApiResponse<ServiceOption>>(environment.apiBaseUrl + 'services');
  }
}

import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceOrder, ServiceOrderFormData, ClientOption, CashRegisterOption } from '../models/service-order.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'service-orders';

  getAll(): Observable<PagedApiResponse<ServiceOrder>> {
    return this.http.get<PagedApiResponse<ServiceOrder>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<ServiceOrder>> {
    return this.http.get<ApiResponse<ServiceOrder>>(`${this.apiUrl}/${id}`);
  }

  create(order: ServiceOrderFormData): Observable<ApiResponse<ServiceOrder>> {
    return this.http.post<ApiResponse<ServiceOrder>>(this.apiUrl, order);
  }

  update(order: Pick<ServiceOrderFormData, 'clientId' | 'discount' | 'notes' | 'total'> & { id: number }): Observable<ApiResponse<ServiceOrder>> {
    return this.http.put<ApiResponse<ServiceOrder>>(this.apiUrl, order);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getClients(): Observable<PagedApiResponse<ClientOption>> {
    return this.http.get<PagedApiResponse<ClientOption>>(environment.apiBaseUrl + 'clients');
  }

  getCashRegisters(): Observable<PagedApiResponse<CashRegisterOption>> {
    return this.http.get<PagedApiResponse<CashRegisterOption>>(environment.apiBaseUrl + 'cash-registers');
  }
}

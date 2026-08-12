import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceOrder, ServiceOrderFormData, Client, CashRegister } from '../models/service-order.model';
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

  update(order: any): Observable<ApiResponse<ServiceOrder>> {
    return this.http.put<ApiResponse<ServiceOrder>>(this.apiUrl, order);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getClients(): Observable<PagedApiResponse<Client>> {
    return this.http.get<PagedApiResponse<Client>>(environment.apiBaseUrl + 'clients');
  }

  getCashRegisters(): Observable<PagedApiResponse<CashRegister>> {
    return this.http.get<PagedApiResponse<CashRegister>>(environment.apiBaseUrl + 'cash-registers');
  }
}

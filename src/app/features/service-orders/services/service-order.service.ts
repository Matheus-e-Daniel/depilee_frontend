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

  getAll(clientId?: number): Observable<PagedApiResponse<ServiceOrder>> {
    const params: Record<string, string> = clientId ? { clientId: String(clientId) } : {};
    return this.http.get<PagedApiResponse<ServiceOrder>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<ServiceOrder>> {
    return this.http.get<ApiResponse<ServiceOrder>>(`${this.apiUrl}/${id}`);
  }

  create(order: Partial<ServiceOrderFormData>): Observable<ApiResponse<ServiceOrder>> {
    return this.http.post<ApiResponse<ServiceOrder>>(this.apiUrl, order);
  }

  update(order: { id: number; clientId: number | null; sellerUserId?: number | null; discount: number; notes: string | null }): Observable<ApiResponse<ServiceOrder>> {
    return this.http.put<ApiResponse<ServiceOrder>>(this.apiUrl, order);
  }

  applyCredit(id: number, amount: number): Observable<ApiResponse<ServiceOrder>> {
    return this.http.post<ApiResponse<ServiceOrder>>(`${this.apiUrl}/${id}/apply-credit`, { amount });
  }

  cancel(id: number, reason?: string): Observable<ApiResponse<ServiceOrder>> {
    return this.http.post<ApiResponse<ServiceOrder>>(`${this.apiUrl}/cancel`, { id, reason });
  }

  complete(id: number): Observable<ApiResponse<ServiceOrder>> {
    return this.http.post<ApiResponse<ServiceOrder>>(`${this.apiUrl}/complete`, { id });
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

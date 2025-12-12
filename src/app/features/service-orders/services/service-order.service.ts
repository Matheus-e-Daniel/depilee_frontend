// src/app/features/service-orders/services/service-order.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceOrder, ServiceOrderFormData, PagedResponse, Client, CashRegister } from '../models/service-order.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5093/v1/service-orders';

  getAll(): Observable<PagedResponse<ServiceOrder>> {
    return this.http.get<PagedResponse<ServiceOrder>>(this.apiUrl);
  }

  getById(id: number): Observable<ServiceOrder> {
    return this.http.get<ServiceOrder>(`${this.apiUrl}/${id}`);
  }

  create(order: ServiceOrderFormData): Observable<ServiceOrder> {
    return this.http.post<ServiceOrder>(this.apiUrl, order);
  }

  update(order: any): Observable<ServiceOrder> {
    return this.http.put<ServiceOrder>(this.apiUrl, order);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getClients(): Observable<PagedResponse<Client>> {
    return this.http.get<PagedResponse<Client>>('http://localhost:5093/v1/clients');
  }

  getCashRegisters(): Observable<PagedResponse<CashRegister>> {
    return this.http.get<PagedResponse<CashRegister>>('http://localhost:5093/v1/cash-registers');
  }
}

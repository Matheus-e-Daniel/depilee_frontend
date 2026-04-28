import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ServiceOrder, ServiceOrderFormData, PagedResponse, Client, CashRegister } from '../models/service-order.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'service-orders';

  getAll(): Observable<PagedResponse<ServiceOrder>> {
    return this.http.get<PagedResponse<ServiceOrder>>(this.apiUrl).pipe(
      tap(result => console.log('getAll service-orders:', result))
    );
  }

  getById(id: number): Observable<ServiceOrder> {
    return this.http.get<ServiceOrder>(`${this.apiUrl}/${id}`).pipe(
      tap(result => console.log('getById service-order:', result))
    );
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
    return this.http.get<PagedResponse<Client>>(environment.apiBaseUrl + 'clients').pipe(
      tap(result => console.log('getClients:', result))
    );
  }

  getCashRegisters(): Observable<PagedResponse<CashRegister>> {
    return this.http.get<PagedResponse<CashRegister>>(environment.apiBaseUrl + 'cash-registers').pipe(
      tap(result => console.log('getCashRegisters:', result))
    );
  }
}

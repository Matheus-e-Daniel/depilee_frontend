import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse, CashRegister, CashRegisterFormData } from '../models/cash-register.model';

@Injectable({
  providedIn: 'root'
})
export class CashRegisterService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5093/v1/cash-registers';

  getAll(): Observable<PagedResponse<CashRegister>> {
    return this.http.get<PagedResponse<CashRegister>>(this.apiUrl);
  }

  getById(id: string): Observable<CashRegister> {
    return this.http.get<CashRegister>(`${this.apiUrl}/${id}`);
  }

  create(cashRegister: CashRegisterFormData): Observable<CashRegister> {
    return this.http.post<CashRegister>(this.apiUrl, cashRegister);
  }

  update(cashRegister: any): Observable<CashRegister> {
    return this.http.put<CashRegister>(this.apiUrl, cashRegister);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  closeCashRegister(data: { cashRegisterId: number; finalBalance: number; notes?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/close`, data);
  }
}

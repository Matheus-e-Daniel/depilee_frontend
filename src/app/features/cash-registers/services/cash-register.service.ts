import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CashRegister, CashRegisterFormData } from '../models/cash-register.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CashRegisterService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'cash-registers';

  getAll(): Observable<PagedApiResponse<CashRegister>> {
    return this.http.get<PagedApiResponse<CashRegister>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<CashRegister>> {
    return this.http.get<ApiResponse<CashRegister>>(`${this.apiUrl}/${id}`);
  }

  create(cashRegister: CashRegisterFormData): Observable<ApiResponse<CashRegister>> {
    return this.http.post<ApiResponse<CashRegister>>(this.apiUrl, cashRegister);
  }

  update(cashRegister: CashRegisterFormData & { id: number }): Observable<ApiResponse<CashRegister>> {
    return this.http.put<ApiResponse<CashRegister>>(this.apiUrl, cashRegister);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  closeCashRegister(data: { cashRegisterId: number; finalBalance: number; notes?: string }): Observable<ApiResponse<CashRegister>> {
    return this.http.post<ApiResponse<CashRegister>>(`${this.apiUrl}/close`, data);
  }
}

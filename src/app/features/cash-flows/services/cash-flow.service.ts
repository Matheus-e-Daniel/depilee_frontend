import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CashFlow, CashFlowFormData } from '../models/cash-flow.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CashFlowService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'cash-flows';

  getAllByCashRegister(cashRegisterId: number): Observable<PagedApiResponse<CashFlow>> {
    return this.http.get<PagedApiResponse<CashFlow>>(`${this.apiUrl}/cash-register/${cashRegisterId}`);
  }

  getById(id: number): Observable<ApiResponse<CashFlow>> {
    return this.http.get<ApiResponse<CashFlow>>(`${this.apiUrl}/${id}`);
  }

  create(cashFlow: CashFlowFormData): Observable<ApiResponse<CashFlow>> {
    return this.http.post<ApiResponse<CashFlow>>(this.apiUrl, cashFlow);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}

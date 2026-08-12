import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentMethod, PaymentMethodFormData } from '../models/payment-method.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'payment-methods';

  getAll(): Observable<PagedApiResponse<PaymentMethod>> {
    return this.http.get<PagedApiResponse<PaymentMethod>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<PaymentMethod>> {
    return this.http.get<ApiResponse<PaymentMethod>>(`${this.apiUrl}/${id}`);
  }

  create(paymentMethod: PaymentMethodFormData): Observable<ApiResponse<PaymentMethod>> {
    const payload = {
      ...paymentMethod,
      type: Number(paymentMethod.type),
      installments: Number(paymentMethod.installments),
      interestRatePerInstallment: Number(paymentMethod.interestRatePerInstallment),
      feePercentage: Number(paymentMethod.feePercentage)
    };
    return this.http.post<ApiResponse<PaymentMethod>>(this.apiUrl, payload);
  }

  update(paymentMethod: PaymentMethod): Observable<ApiResponse<PaymentMethod>> {
    const payload = {
      ...paymentMethod,
      type: Number(paymentMethod.type),
      installments: Number(paymentMethod.installments),
      interestRatePerInstallment: Number(paymentMethod.interestRatePerInstallment),
      feePercentage: Number(paymentMethod.feePercentage)
    };
    return this.http.put<ApiResponse<PaymentMethod>>(this.apiUrl, payload);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}

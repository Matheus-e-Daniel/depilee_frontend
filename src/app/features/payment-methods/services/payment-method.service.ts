import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaymentMethod, PaymentMethodFormData, PagedResponse } from '../models/payment-method.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'payment-methods';

  getAll(): Observable<PaymentMethod[]> {
    return this.http.get<PagedResponse<PaymentMethod>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getById(id: string): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(`${this.apiUrl}/${id}`);
  }

  create(paymentMethod: PaymentMethodFormData): Observable<PaymentMethod> {
    const payload = {
      ...paymentMethod,
      type: Number(paymentMethod.type),
      installments: Number(paymentMethod.installments),
      interestRatePerInstallment: Number(paymentMethod.interestRatePerInstallment),
      feePercentage: Number(paymentMethod.feePercentage)
    };
    return this.http.post<PaymentMethod>(this.apiUrl, payload);
  }

  update(paymentMethod: PaymentMethod): Observable<PaymentMethod> {
    const payload = {
      ...paymentMethod,
      type: Number(paymentMethod.type),
      installments: Number(paymentMethod.installments),
      interestRatePerInstallment: Number(paymentMethod.interestRatePerInstallment),
      feePercentage: Number(paymentMethod.feePercentage)
    };
    return this.http.put<PaymentMethod>(this.apiUrl, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

import { environment } from '../../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentMethod } from '../../../payment-methods/models/payment-method.model';
import { ApiResponse, PagedApiResponse } from '../../../../core/models/api-response.model';
import { CreatePaymentData, PayInstallmentData, Payment, PaymentInstallment } from './payment.model';

@Injectable({ providedIn: 'root' })
export class ServiceOrderPaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'payments';
  private paymentMethodsUrl = environment.apiBaseUrl + 'payment-methods';

  create(payload: CreatePaymentData): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(this.apiUrl, payload);
  }

  payInstallment(payload: PayInstallmentData): Observable<ApiResponse<PaymentInstallment>> {
    return this.http.post<ApiResponse<PaymentInstallment>>(`${this.apiUrl}/pay-installment`, payload);
  }

  getByServiceOrder(serviceOrderId: number): Observable<PagedApiResponse<Payment>> {
    return this.http.get<PagedApiResponse<Payment>>(`${this.apiUrl}/service-order/${serviceOrderId}`);
  }

  getPaymentMethods(): Observable<PagedApiResponse<PaymentMethod>> {
    return this.http.get<PagedApiResponse<PaymentMethod>>(this.paymentMethodsUrl);
  }
}

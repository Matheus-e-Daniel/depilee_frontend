import { environment } from '../../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentMethod } from '../../../payment-methods/models/payment-method.model';
import { ApiResponse, PagedApiResponse } from '../../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ServiceOrderPaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'payments';
  private paymentMethodsUrl = environment.apiBaseUrl + 'payment-methods';

  savePayment(_orderId: number, paymentData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, paymentData);
  }

  getPaymentMethods(): Observable<PagedApiResponse<PaymentMethod>> {
    return this.http.get<PagedApiResponse<PaymentMethod>>(this.paymentMethodsUrl);
  }
}

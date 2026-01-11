import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface PagedResponse<T> {
  data: T[];
}

@Injectable({ providedIn: 'root' })
export class ServiceOrderPaymentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5093/v1/payments';
  private paymentMethodsUrl = 'http://localhost:5093/v1/payment-methods';

  savePayment(_orderId: number, paymentData: any): Observable<any> {
    return this.http.post(this.apiUrl, paymentData);
  }

  getPaymentMethods(): Observable<PagedResponse<PaymentMethod>> {
    return this.http.get<PagedResponse<PaymentMethod>>(this.paymentMethodsUrl);
  }
}

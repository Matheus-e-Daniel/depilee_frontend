import { environment } from '../../../../environments/environment';
// src/app/features/products/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse, Product, ProductFormData } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'products';

  getAll(): Observable<PagedResponse<Product>> {
  return this.http.get<PagedResponse<Product>>(this.apiUrl);
}

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: ProductFormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(product: any): Observable<Product> {
  return this.http.put<Product>(this.apiUrl, product);
}


  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

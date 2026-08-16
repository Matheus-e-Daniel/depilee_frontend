import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductFormData } from '../models/product.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'products';

  getAll(): Observable<PagedApiResponse<Product>> {
  return this.http.get<PagedApiResponse<Product>>(this.apiUrl);
}

  getById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  create(product: ProductFormData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, product);
  }

  update(product: ProductFormData & { id: number }): Observable<ApiResponse<Product>> {
  return this.http.put<ApiResponse<Product>>(this.apiUrl, product);
}


  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}

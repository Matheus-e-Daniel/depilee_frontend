import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand, BrandFormData } from '../models/brand.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private http = inject(HttpClient);
    private apiUrl = environment.apiBaseUrl + 'brands';

  getAll(): Observable<PagedApiResponse<Brand>> {
    return this.http.get<PagedApiResponse<Brand>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Brand>> {
    return this.http.get<ApiResponse<Brand>>(`${this.apiUrl}/${id}`);
  }

  create(brand: BrandFormData): Observable<ApiResponse<Brand>> {
    return this.http.post<ApiResponse<Brand>>(this.apiUrl, brand);
  }

  update(brand: any): Observable<ApiResponse<Brand>> {
    return this.http.put<ApiResponse<Brand>>(this.apiUrl, brand);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}

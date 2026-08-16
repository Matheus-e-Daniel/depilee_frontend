import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryFormData } from '../models/category.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'categories';

  getAll(): Observable<PagedApiResponse<Category>> {
    return this.http.get<PagedApiResponse<Category>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/${id}`);
  }

  create(category: CategoryFormData): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(this.apiUrl, category);
  }

  update(category: CategoryFormData & { id: number }): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(this.apiUrl, category);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}

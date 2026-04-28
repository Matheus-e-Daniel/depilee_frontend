import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse, Brand, BrandFormData } from '../models/brand.model';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private http = inject(HttpClient);
    private apiUrl = environment.apiBaseUrl + 'brands';

  getAll(): Observable<PagedResponse<Brand>> {
    return this.http.get<PagedResponse<Brand>>(this.apiUrl);
  }

  getById(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.apiUrl}/${id}`);
  }

  create(brand: BrandFormData): Observable<Brand> {
    return this.http.post<Brand>(this.apiUrl, brand);
  }

  update(brand: any): Observable<Brand> {
    return this.http.put<Brand>(this.apiUrl, brand);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

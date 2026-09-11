import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientFormData, ClientQuickCreateData } from '../models/client.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'clients';

  getAll(): Observable<PagedApiResponse<Client>> {
    return this.http.get<PagedApiResponse<Client>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.apiUrl}/${id}`);
  }

  create(client: ClientFormData): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(this.apiUrl, client);
  }

  quickCreate(client: ClientQuickCreateData): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(this.apiUrl, client);
  }

  update(client: ClientFormData & { id: number }): Observable<ApiResponse<Client>> {
    return this.http.put<ApiResponse<Client>>(this.apiUrl, client);
  }

  adjustCredit(id: number, amount: number, reason?: string): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(`${this.apiUrl}/${id}/credit`, { amount, reason });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}

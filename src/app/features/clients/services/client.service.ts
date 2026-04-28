import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientFormData, PagedResponse } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'clients';

  getAll(): Observable<PagedResponse<Client>> {
    return this.http.get<PagedResponse<Client>>(this.apiUrl);
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  create(client: ClientFormData): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  update(client: any): Observable<Client> {
    return this.http.put<Client>(this.apiUrl, client);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

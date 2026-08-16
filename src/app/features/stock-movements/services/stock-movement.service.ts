import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockMovement } from '../models/stock-movement.model';
import { PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'stock-movements';

  getAll(): Observable<PagedApiResponse<StockMovement>> {
    return this.http.get<PagedApiResponse<StockMovement>>(this.apiUrl);
  }
}

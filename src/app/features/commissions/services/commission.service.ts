import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CommissionSettings, CommissionApplyRequest, CommissionResult } from '../models/commission.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CommissionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'commissions';

  getSettings(): Observable<ApiResponse<CommissionSettings>> {
    return this.http.get<ApiResponse<CommissionSettings>>(`${this.apiUrl}/settings`);
  }

  updateSettings(settings: CommissionSettings): Observable<ApiResponse<CommissionSettings>> {
    return this.http.put<ApiResponse<CommissionSettings>>(`${this.apiUrl}/settings`, settings);
  }

  applyCommission(request: CommissionApplyRequest): Observable<ApiResponse<CommissionResult>> {
    return this.http.post<ApiResponse<CommissionResult>>(`${this.apiUrl}/`, request);
  }

  getByUser(userId: string, startDate?: string, endDate?: string): Observable<ApiResponse<CommissionResult>> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<CommissionResult>>(`${this.apiUrl}/users/${userId}`, { params });
  }
}

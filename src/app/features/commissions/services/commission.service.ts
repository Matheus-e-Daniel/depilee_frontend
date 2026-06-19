import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CommissionSettings, CommissionApplyRequest, CommissionResult } from '../models/commission.model';

@Injectable({ providedIn: 'root' })
export class CommissionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'commissions';

  getSettings(): Observable<CommissionSettings> {
    return this.http.get<CommissionSettings>(`${this.apiUrl}/settings`);
  }

  updateSettings(settings: CommissionSettings): Observable<CommissionSettings> {
    return this.http.put<CommissionSettings>(`${this.apiUrl}/settings`, settings);
  }

  applyCommission(request: CommissionApplyRequest): Observable<CommissionResult> {
    return this.http.post<CommissionResult>(`${this.apiUrl}/`, request);
  }

  getByUser(userId: number, startDate?: string, endDate?: string): Observable<CommissionResult> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<CommissionResult>(`${this.apiUrl}/users/${userId}`, { params });
  }
}

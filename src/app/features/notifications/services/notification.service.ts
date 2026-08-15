import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

export interface Notification {
  id: number;
  title: string;
  notificationType: number;
  notificationStatus: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'notifications';

  getAll(): Observable<PagedApiResponse<Notification>> {
    return this.http.get<PagedApiResponse<Notification>>(this.apiUrl);
  }

  markAsRead(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${id}/mark-as-read`, {});
  }

}
